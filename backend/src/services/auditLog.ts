type AuditDb = {
  auditLog: {
    create(args: {
      data: {
        actorId?: number | null;
        action: string;
        objectType: string;
        objectId: string;
        oldValue?: unknown;
        newValue?: unknown;
        ipAddress?: string | null;
        userAgent?: string | null;
      };
    }): Promise<unknown>;
  };
};

export type AuditContext = {
  actorId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/** Removes secrets before old/new payloads are persisted to immutable audit_log. */
function redactAuditPayload(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(redactAuditPayload);
  if (!value || typeof value !== "object") return value;

  const jsonValue = (value as { toJSON?: () => unknown }).toJSON;
  if (typeof jsonValue === "function") {
    return redactAuditPayload(jsonValue.call(value));
  }

  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, currentValue]) => {
    const normalizedKey = key.toLowerCase();
    if (
      normalizedKey.includes("password") ||
      normalizedKey.includes("token") ||
      normalizedKey.includes("session") ||
      normalizedKey.includes("secret")
    ) {
      return [key, "[REDACTED]"];
    }

    return [key, redactAuditPayload(currentValue)];
  }));
}

/** Appends an immutable audit log record after redacting sensitive payload fields. */
export async function appendAuditLog(
  db: AuditDb,
  context: AuditContext,
  payload: {
    action: string;
    objectType: string;
    objectId: string | number;
    oldValue?: unknown;
    newValue?: unknown;
  },
) {
  await db.auditLog.create({
    data: {
      actorId: context.actorId ?? null,
      action: payload.action,
      objectType: payload.objectType,
      objectId: String(payload.objectId),
      oldValue: redactAuditPayload(payload.oldValue),
      newValue: redactAuditPayload(payload.newValue),
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    },
  });
}
