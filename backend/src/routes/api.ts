import { randomUUID } from "node:crypto";
import { Router, type Request, type RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import { appendAuditLog, type AuditContext } from "../services/auditLog.ts";
import { appendBatchStatusHistory } from "../services/batchStatusHistory.ts";
import { jsonSafe } from "../utils/json.ts";
import {
  AccountRole,
  BatchStatus as PrismaBatchStatus,
  CertificateStatus,
  CertificateType,
  IncidentType,
  QrCodeStatus,
  TransportStatus,
} from "../generated/prisma/enums.ts";

export const apiRouter = Router();

const loginRoleMap = {
  admin: ["ADMIN"],
  farm: ["FARMER"],
  store: ["STORE", "WAREHOUSE"],
  transporter: ["TRANSPORTER"],
  inspector: ["INSPECTOR"],
} as const;

const mobileLoginRoles = ["farm", "store", "transporter", "inspector"] as const;

function mapAccountRoleToLoginRole(accountRole: string) {
  const roleEntry = Object.entries(loginRoleMap).find(([, allowedRoles]) =>
    (allowedRoles as readonly string[]).includes(accountRole),
  );

  return roleEntry?.[0] as keyof typeof loginRoleMap | undefined;
}

/** Resolves the mobile login role without allowing Admin into the mobile flow. */
function loginRoleForAccountRole(accountRole: string) {
  return mobileLoginRoles.find((loginRole) => (
    loginRoleMap[loginRole].some((allowedRole) => allowedRole === accountRole)
  )) as keyof typeof loginRoleMap | undefined;
}

const certificateTypes = new Set(Object.values(CertificateType));
const incidentTypes = new Set(Object.values(IncidentType));
const protectedRoles = new Set<string>(Object.values(AccountRole));
const hiddenAuditReadActions = ["AUDIT_LOG_SEARCHED", "AUDIT_LOG_VIEWED", "AUDIT_LOG_EXPORTED", "BATCH_AUDIT_TIMELINE_VIEWED"];

type CurrentUser = {
  accountId: number;
  role: AccountRole;
  partnerId: number | null;
};

type RequestWithUser = Request & {
  currentUser?: CurrentUser;
};

/** Builds audit context from request metadata for UC26-UC28 audit trail. */
function auditContextFromRequest(req: RequestWithUser): AuditContext {
  return {
    actorId: req.currentUser?.accountId ?? null,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? null,
  };
}

/** Reads current account from X-Account-Id so ownership checks can use partner_id. */
const authenticate: RequestHandler = async (req: RequestWithUser, res, next) => {
  try {
    const accountId = Number(req.get("x-account-id"));
    if (!Number.isInteger(accountId)) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const account = await prisma.account.findFirst({
      where: {
        accountId,
        status: "ACTIVE",
      },
      select: {
        accountId: true,
        role: true,
        partnerId: true,
      },
    });

    if (!account) {
      res.status(401).json({ message: "Invalid account" });
      return;
    }

    req.currentUser = account;
    next();
  } catch (error) {
    next(error);
  }
};

/** Allows only selected roles to access a Use Case endpoint. */
function requireRole(...roles: AccountRole[]): RequestHandler {
  return (req: RequestWithUser, res, next) => {
    if (!req.currentUser || !roles.includes(req.currentUser.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}

/** Returns true when the authenticated account is an administrator. */
function isAdmin(user?: CurrentUser) {
  return user?.role === "ADMIN";
}

/** Generates a hard-to-guess QR trace token for UC29-UC31 public trace. */
function createTraceToken() {
  return randomUUID().replace(/-/g, "");
}

/** Normalizes Express route params for Prisma string filters. */
function paramText(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

/** Builds role-specific batch filtering for UC08-UC13 data ownership. */
function batchWhereForUser(user?: CurrentUser) {
  if (!user || isAdmin(user)) return {};
  if (user.role === "FARMER") return { farmPartnerId: user.partnerId ?? -1 };
  if (user.role === "STORE" || user.role === "WAREHOUSE") {
    return {
      transport: {
        OR: [
          { storePartnerId: user.partnerId ?? -1 },
          { receiverPartnerId: user.partnerId ?? -1 },
        ],
      },
    };
  }
  if (user.role === "TRANSPORTER") {
    return {
      transport: {
        transporterPartnerId: user.partnerId ?? -1,
      },
    };
  }
  return {};
}

/** Builds role-specific transport filtering for UC19-UC25 data ownership. */
function transportWhereForUser(user?: CurrentUser) {
  if (!user || isAdmin(user)) return {};
  if (user.role === "FARMER") {
    return {
      OR: [
        { farmPartnerId: user.partnerId ?? -1 },
        { shipperPartnerId: user.partnerId ?? -1 },
      ],
    };
  }
  if (user.role === "STORE" || user.role === "WAREHOUSE") {
    return {
      OR: [
        { storePartnerId: user.partnerId ?? -1 },
        { receiverPartnerId: user.partnerId ?? -1 },
      ],
    };
  }
  if (user.role === "TRANSPORTER") return { transporterPartnerId: user.partnerId ?? -1 };
  return {};
}

function parseDateInput(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const text = value.trim();
  const vnDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (vnDate) {
    const [, day, month, year] = vnDate;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeCertificateType(value: unknown) {
  if (typeof value !== "string") return CertificateType.OTHER;
  return certificateTypes.has(value as CertificateType) ? value as CertificateType : CertificateType.OTHER;
}

function normalizeCertificateStatus(value: unknown) {
  if (value === "expired") return CertificateStatus.EXPIRED;
  if (value === "revoked") return CertificateStatus.REVOKED;
  return CertificateStatus.ACTIVE;
}

function normalizeBatchStatus(value: unknown) {
  if (value === "ready") return PrismaBatchStatus.AT_WAREHOUSE;
  if (value === "in_transit") return PrismaBatchStatus.IN_TRANSIT;
  if (value === "delivered") return PrismaBatchStatus.DELIVERED;
  if (value === "cancelled") return PrismaBatchStatus.CANCELLED;
  return PrismaBatchStatus.CREATED;
}

function normalizeIncidentType(value: unknown) {
  if (typeof value !== "string") return IncidentType.OTHER;
  return incidentTypes.has(value as IncidentType) ? value as IncidentType : IncidentType.OTHER;
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOptionalText(value: unknown) {
  return typeof value === "string" ? value.trim() || null : null;
}

function buildBatchInclude() {
  return {
    farmPartner: true,
    certificates: {
      include: {
        certificate: true,
      },
    },
    qrCode: true,
  } as const;
}

function buildStoreDeliveryInclude() {
  return {
    batch: {
      include: {
        farmPartner: true,
      },
    },
    shipperPartner: true,
    receiverPartner: true,
    checkpoints: { orderBy: { sequence: "asc" } },
    incidents: true,
  } as const;
}

function buildTransportInclude() {
  return {
    batch: {
      include: buildBatchInclude(),
    },
    shipperPartner: true,
    receiverPartner: true,
    checkpoints: { orderBy: { sequence: "asc" } },
    incidents: true,
  } as const;
}

type AuditLogQuery = {
  page?: string;
  pageSize?: string;
  keyword?: string;
  action?: string;
  objectType?: string;
  objectId?: string;
  actorId?: string;
  ipAddress?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

/** Parses pagination for UC28 audit log search. */
function parsePagination(query: AuditLogQuery) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(query.pageSize) || 10));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

/** Builds the read-only filter set for UC28 audit log search. */
function buildAuditLogWhere(query: AuditLogQuery) {
  const where: {
    NOT?: { action: { in: string[] } };
    action?: { contains: string; mode: "insensitive" };
    objectType?: string | { in: string[] };
    objectId?: { contains: string; mode: "insensitive" };
    actorId?: number;
    ipAddress?: { contains: string; mode: "insensitive" };
    createdAt?: { gte?: Date; lte?: Date };
    OR?: Array<{
      action?: { contains: string; mode: "insensitive" };
      objectType?: { contains: string; mode: "insensitive" };
      objectId?: { contains: string; mode: "insensitive" };
      ipAddress?: { contains: string; mode: "insensitive" };
      actor?: {
        OR: Array<{
          fullName?: { contains: string; mode: "insensitive" };
          username?: { contains: string; mode: "insensitive" };
          email?: { contains: string; mode: "insensitive" };
        }>;
      };
    }>;
  } = {
    NOT: { action: { in: hiddenAuditReadActions } },
  };

  const keyword = query.keyword?.trim();
  const action = query.action?.trim();
  const objectType = query.objectType?.trim();
  const objectId = query.objectId?.trim();
  const ipAddress = query.ipAddress?.trim();
  const status = query.status?.trim();
  const actorId = Number(query.actorId);
  const dateFrom = parseDateInput(query.dateFrom);
  const dateTo = parseDateInput(query.dateTo);

  if (action) where.action = { contains: action, mode: "insensitive" };
  if (objectType) {
    const objectTypes = objectType.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
    where.objectType = objectTypes.length > 1 ? { in: objectTypes } : objectTypes[0];
  }
  if (objectId) where.objectId = { contains: objectId, mode: "insensitive" };
  if (ipAddress) where.ipAddress = { contains: ipAddress, mode: "insensitive" };
  if (status) where.action = { contains: status, mode: "insensitive" };
  if (Number.isInteger(actorId)) where.actorId = actorId;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) {
      dateTo.setHours(23, 59, 59, 999);
      where.createdAt.lte = dateTo;
    }
  }

  if (keyword) {
    where.OR = [
      { action: { contains: keyword, mode: "insensitive" } },
      { objectType: { contains: keyword, mode: "insensitive" } },
      { objectId: { contains: keyword, mode: "insensitive" } },
      { ipAddress: { contains: keyword, mode: "insensitive" } },
      {
        actor: {
          OR: [
            { fullName: { contains: keyword, mode: "insensitive" } },
            { username: { contains: keyword, mode: "insensitive" } },
            { email: { contains: keyword, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  return where;
}

/** Redacts sensitive fields before audit payloads are exposed to Admin UI. */
function redactAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactAuditValue);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, currentValue]) => {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey.includes("password") || normalizedKey.includes("token")) {
      return [key, "[REDACTED]"];
    }

    return [key, redactAuditValue(currentValue)];
  }));
}

/** Maps audit records into the read model used by UC26-UC28. */
function mapAuditLog(item: {
  auditId: bigint;
  actorId: number | null;
  action: string;
  objectType: string;
  objectId: string;
  oldValue: unknown;
  newValue: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  actor?: {
    accountId: number;
    username: string;
    fullName: string;
    email: string;
    role: AccountRole;
  } | null;
}) {
  return {
    auditId: String(item.auditId),
    timestamp: item.createdAt.toISOString(),
    actorId: item.actorId ? String(item.actorId) : "",
    actor: item.actor ? {
      id: String(item.actor.accountId),
      username: item.actor.username,
      fullName: item.actor.fullName,
      email: item.actor.email,
      role: item.actor.role,
    } : null,
    action: item.action,
    objectType: item.objectType,
    objectId: item.objectId,
    oldValue: redactAuditValue(item.oldValue),
    newValue: redactAuditValue(item.newValue),
    ipAddress: item.ipAddress ?? "",
    userAgent: item.userAgent ?? "",
  };
}

/** Builds a compact diff label for UC27 batch audit timeline. */
function auditValueSummary(value: unknown) {
  if (!value || typeof value !== "object") return value ? String(value) : "N/A";
  const record = value as Record<string, unknown>;
  if (typeof record.status === "string") return record.status;
  if (typeof record.batchCode === "string") return record.batchCode;
  if (typeof record.transportStatus === "string") return record.transportStatus;
  if (typeof record.statusAtCheckpoint === "string") return record.statusAtCheckpoint;
  if (typeof record.action === "string") return record.action;
  return "Bản ghi dữ liệu";
}

apiRouter.get("/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/auth/login", async (req, res, next) => {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    const identifier = username?.trim() || email?.trim();
    if (!identifier || !password) {
      res.status(400).json({ message: "Missing login credentials" });
      return;
    }

    const account = await prisma.account.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
      select: {
        accountId: true,
        username: true,
        passwordHash: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        partnerId: true,
        status: true,
      },
    });

    const resolvedRole = account ? loginRoleForAccountRole(account.role) : undefined;

    if (!account || account.passwordHash !== password) {
      await appendAuditLog(prisma, {
        actorId: account?.accountId ?? null,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? null,
      }, {
        action: "LOGIN_FAILED",
        objectType: "AUTH",
        objectId: identifier,
        newValue: { identifier, reason: "INVALID_CREDENTIALS", role: resolvedRole ?? "" },
      });
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    if (account.status !== "ACTIVE") {
      await appendAuditLog(prisma, {
        actorId: account.accountId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? null,
      }, {
        action: "LOGIN_FAILED",
        objectType: "AUTH",
        objectId: account.accountId,
        newValue: { identifier, reason: "ACCOUNT_LOCKED", role: resolvedRole ?? "" },
      });
      res.status(403).json({ message: "Account is locked" });
      return;
    }

    if (!resolvedRole) {
      await appendAuditLog(prisma, {
        actorId: account.accountId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? null,
      }, {
        action: "LOGIN_FAILED",
        objectType: "AUTH",
        objectId: account.accountId,
        newValue: { identifier, reason: "UNSUPPORTED_ROLE", role: account.role },
      });
      res.status(403).json({ message: "Account role is not supported" });
      return;
    }

    res.json(
      jsonSafe({
        user: {
          id: String(account.accountId),
          username: account.username,
          fullName: account.fullName,
          email: account.email,
          phone: account.phone ?? "",
          role: resolvedRole,
          partnerId: account.partnerId ? String(account.partnerId) : "",
          status: "active",
        },
      }),
    );
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/auth/register-customer", async (req, res, next) => {
  try {
    const { fullName, username, email, phone, password } = req.body as {
      fullName?: string;
      username?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    const name = fullName?.trim();
    const userName = username?.trim();
    const emailAddress = email?.trim();
    const passwordValue = password?.trim();

    if (!name || !userName || !emailAddress || !passwordValue) {
      res.status(400).json({ message: "Missing customer registration information" });
      return;
    }

    const existingAccount = await prisma.account.findFirst({
      where: {
        OR: [
          { username: userName },
          { email: emailAddress },
        ],
      },
      select: { accountId: true },
    });

    if (existingAccount) {
      res.status(409).json({ message: "Username or email already exists" });
      return;
    }

    const account = await prisma.account.create({
      data: {
        username: userName,
        passwordHash: passwordValue,
        fullName: name,
        email: emailAddress,
        phone: phone?.trim() || null,
        role: "INSPECTOR",
        status: "ACTIVE",
      },
      select: {
        accountId: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    res.status(201).json(
      jsonSafe({
        user: {
          id: String(account.accountId),
          fullName: account.fullName,
          email: account.email,
          phone: account.phone ?? "",
          role: "inspector",
          status: "active",
        },
      }),
    );
  } catch (error) {
    next(error);
  }
});

/** Returns UC26 overview numbers for the immutable Audit Log module. */
apiRouter.get("/audit-logs/summary", authenticate, requireRole("ADMIN"), async (req: RequestWithUser, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const visibleAuditWhere = buildAuditLogWhere({});
    const [
      total,
      today,
      byObjectType,
      byAction,
      recentLogs,
      topActors,
      activityRows,
    ] = await Promise.all([
      prisma.auditLog.count({ where: visibleAuditWhere }),
      prisma.auditLog.count({ where: { ...visibleAuditWhere, createdAt: { gte: startOfToday } } }),
      prisma.auditLog.groupBy({
        by: ["objectType"],
        where: visibleAuditWhere,
        _count: { _all: true },
        orderBy: { _count: { objectType: "desc" } },
        take: 5,
      }),
      prisma.auditLog.groupBy({
        by: ["action"],
        where: visibleAuditWhere,
        _count: { _all: true },
        orderBy: { _count: { action: "desc" } },
        take: 5,
      }),
      prisma.auditLog.findMany({
        where: visibleAuditWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          actor: {
            select: {
              accountId: true,
              username: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.groupBy({
        by: ["actorId"],
        where: { ...visibleAuditWhere, actorId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { actorId: "desc" } },
        take: 5,
      }),
      prisma.auditLog.findMany({
        where: { ...visibleAuditWhere, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const actorIds = topActors
      .map((item) => item.actorId)
      .filter((actorId): actorId is number => Number.isInteger(actorId));
    const actors = actorIds.length ? await prisma.account.findMany({
      where: { accountId: { in: actorIds } },
      select: { accountId: true, username: true, fullName: true, email: true, role: true },
    }) : [];
    const actorById = new Map(actors.map((actor) => [actor.accountId, actor]));

    const activityByDay = new Map<string, number>();
    for (let offset = 0; offset < 7; offset += 1) {
      const day = new Date(sevenDaysAgo);
      day.setDate(sevenDaysAgo.getDate() + offset);
      activityByDay.set(day.toISOString().slice(0, 10), 0);
    }
    activityRows.forEach((item) => {
      const day = item.createdAt.toISOString().slice(0, 10);
      activityByDay.set(day, (activityByDay.get(day) ?? 0) + 1);
    });

    res.json(jsonSafe({
      total,
      today,
      byObjectType: byObjectType.map((item) => ({
        objectType: item.objectType,
        count: item._count._all,
      })),
      byAction: byAction.map((item) => ({
        action: item.action,
        count: item._count._all,
      })),
      topActors: topActors.map((item) => {
        const actor = item.actorId ? actorById.get(item.actorId) : null;
        return {
          actorId: item.actorId ? String(item.actorId) : "",
          actorName: actor?.fullName ?? actor?.username ?? "Không xác định",
          role: actor?.role ?? "",
          count: item._count._all,
        };
      }),
      activity: Array.from(activityByDay.entries()).map(([date, count]) => ({ date, count })),
      recentLogs: recentLogs.map(mapAuditLog),
    }));
  } catch (error) {
    next(error);
  }
});

/** Searches audit records for UC28 with multiple criteria and pagination. */
apiRouter.get("/audit-logs", authenticate, requireRole("ADMIN"), async (req: RequestWithUser, res, next) => {
  try {
    const query = req.query as AuditLogQuery;
    const { page, pageSize, skip } = parsePagination(query);
    const where = buildAuditLogWhere(query);

    const [total, entries] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          actor: {
            select: {
              accountId: true,
              username: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    res.json(jsonSafe({
      entries: entries.map(mapAuditLog),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    }));
  } catch (error) {
    next(error);
  }
});

/** Exports UC28 audit query result as CSV without creating read-side audit noise. */
apiRouter.get("/audit-logs/export", authenticate, requireRole("ADMIN"), async (req: RequestWithUser, res, next) => {
  try {
    const where = buildAuditLogWhere(req.query as AuditLogQuery);
    const rows = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
      include: {
        actor: {
          select: {
            accountId: true,
            username: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const escapeCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
    const csvRows = [
      ["Thời gian", "Hành động", "Loại đối tượng", "Mã đối tượng", "Người thực hiện", "IP"].map(escapeCsv).join(","),
      ...rows.map((item) => [
        item.createdAt.toISOString(),
        item.action,
        item.objectType,
        item.objectId,
        item.actor?.fullName ?? item.actor?.username ?? "Không xác định",
        item.ipAddress ?? "",
      ].map(escapeCsv).join(",")),
    ];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="bluefood-audit-${Date.now()}.csv"`);
    res.send(`\uFEFF${csvRows.join("\n")}`);
  } catch (error) {
    next(error);
  }
});

/** Returns one immutable audit payload for UC28 detail inspection. */
apiRouter.get("/audit-logs/:auditId", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const auditId = BigInt(paramText(req.params.auditId));
    const log = await prisma.auditLog.findFirst({
      where: {
        auditId,
        NOT: { action: { in: hiddenAuditReadActions } },
      },
      include: {
        actor: {
          select: {
            accountId: true,
            username: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      res.status(404).json({ message: "Audit log not found" });
      return;
    }

    res.json(jsonSafe(mapAuditLog(log)));
  } catch (error) {
    next(error);
  }
});

/** Builds the UC27 timeline for all audit and status-history changes of one batch. */
async function sendBatchAuditTimeline(req: RequestWithUser, res: Parameters<RequestHandler>[1], next: Parameters<RequestHandler>[2], batchIdentifier: string) {
  try {
    const batchNumericId = Number(batchIdentifier);
    const batch = await prisma.batch.findFirst({
      where: Number.isInteger(batchNumericId)
        ? { OR: [{ batchId: batchNumericId }, { batchCode: batchIdentifier }] }
        : { batchCode: batchIdentifier },
      include: {
        qrCode: { select: { qrId: true } },
        transport: {
          select: {
            transportId: true,
            checkpoints: { select: { checkpointId: true } },
            incidents: { select: { incidentId: true } },
          },
        },
      },
    });

    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    const objectIds = new Map<string, Set<string>>();
    const addObjectId = (objectType: string, objectId: string | number | null | undefined) => {
      if (objectId === null || objectId === undefined) return;
      const key = objectType.toUpperCase();
      objectIds.set(key, (objectIds.get(key) ?? new Set<string>()).add(String(objectId)));
    };

    addObjectId("BATCH", batch.batchId);
    addObjectId("BATCH", batch.batchCode);
    addObjectId("QR", batch.qrCode?.qrId);
    addObjectId("TRANSPORT", batch.transport?.transportId);
    batch.transport?.checkpoints.forEach((checkpoint) => addObjectId("TRANSPORT_CHECKPOINT", checkpoint.checkpointId));
    batch.transport?.incidents.forEach((incident) => addObjectId("INCIDENT", incident.incidentId));

    const auditWhere = Array.from(objectIds.entries()).map(([objectType, ids]) => ({
      objectType,
      objectId: { in: Array.from(ids) },
    }));

    const [auditLogs, statusHistory] = await Promise.all([
      prisma.auditLog.findMany({
        where: { OR: auditWhere },
        orderBy: { createdAt: "asc" },
        include: {
          actor: {
            select: {
              accountId: true,
              username: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.batchStatusHistory.findMany({
        where: { batchId: batch.batchId },
        orderBy: { changedAt: "asc" },
        include: {
          changer: {
            select: {
              accountId: true,
              username: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const auditItems = auditLogs.map((item) => ({
      id: `audit-${String(item.auditId)}`,
      timestamp: item.createdAt.toISOString(),
      actor: item.actor?.fullName ?? item.actor?.username ?? "Hệ thống",
      action: item.action,
      label: item.action,
      from: auditValueSummary(item.oldValue),
      to: auditValueSummary(item.newValue),
      objectType: item.objectType,
      objectId: item.objectId,
      ip: item.ipAddress ?? "",
      payload: mapAuditLog(item),
      source: "audit",
    }));

    const statusItems = statusHistory.map((item) => ({
      id: `status-${String(item.historyId)}`,
      timestamp: item.changedAt.toISOString(),
      actor: item.changer?.fullName ?? item.changer?.username ?? "Hệ thống",
      action: "BATCH_STATUS_CHANGED",
      label: "Cập nhật trạng thái lô hàng",
      from: "N/A",
      to: item.status,
      objectType: "BATCH_STATUS_HISTORY",
      objectId: String(item.historyId),
      ip: "",
      payload: {
        status: item.status,
        locationName: item.locationName,
        note: item.note,
      },
      source: "status-history",
    }));

    const items = [...auditItems, ...statusItems].sort((left, right) => (
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
    ));

    res.json(jsonSafe({
      batchId: batch.batchCode,
      summary: `${items.length} bản ghi · ${statusHistory.length} trạng thái`,
      items,
    }));
  } catch (error) {
    next(error);
  }
}

apiRouter.get("/batches/:batchId/audit-logs", authenticate, requireRole("ADMIN"), async (req: RequestWithUser, res, next) => {
  await sendBatchAuditTimeline(req, res, next, paramText(req.params.batchId));
});

/** Alias endpoint for the UC27 batch timeline from the Audit Log module. */
apiRouter.get("/audit-logs/batches/:batchCode/timeline", authenticate, requireRole("ADMIN"), async (req: RequestWithUser, res, next) => {
  await sendBatchAuditTimeline(req, res, next, paramText(req.params.batchCode));
});

/** Lists accounts for UC01 account management; admin-only. */
apiRouter.get("/accounts", authenticate, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { accountId: "asc" },
      select: {
        accountId: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        partnerId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(jsonSafe(accounts));
  } catch (error) {
    next(error);
  }
});

/** Lists transporter accounts for UC20 transport assignment. */
apiRouter.get("/transporters", authenticate, requireRole("ADMIN", "FARMER"), async (_req, res, next) => {
  try {
    const transporters = await prisma.account.findMany({
      where: {
        role: "TRANSPORTER",
        status: "ACTIVE",
      },
      orderBy: { fullName: "asc" },
      select: {
        accountId: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    res.json(jsonSafe(transporters));
  } catch (error) {
    next(error);
  }
});

/** Lists approved store partners for UC20 transport destination selection. */
apiRouter.get("/stores", authenticate, requireRole("ADMIN", "FARMER"), async (_req, res, next) => {
  try {
    const stores = await prisma.partnerProfile.findMany({
      where: {
        partnerType: "STORE",
        cooperationStatus: "APPROVED",
      },
      orderBy: { partnerName: "asc" },
      select: {
        partnerId: true,
        partnerName: true,
        address: true,
        contactPerson: true,
      },
    });

    res.json(jsonSafe(stores));
  } catch (error) {
    next(error);
  }
});

/** Lists partner profiles for UC32-UC36 partner management. */
apiRouter.get("/partners", authenticate, requireRole("ADMIN", "INSPECTOR"), async (_req, res, next) => {
  try {
    const partners = await prisma.partnerProfile.findMany({
      orderBy: { partnerId: "asc" },
      include: {
        account: {
          select: {
            accountId: true,
            username: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    res.json(jsonSafe(partners));
  } catch (error) {
    next(error);
  }
});

/** Lists batches with partner ownership scope for UC12-UC13. */
apiRouter.get("/batches", authenticate, async (req: RequestWithUser, res, next) => {
  try {
    const batches = await prisma.batch.findMany({
      where: batchWhereForUser(req.currentUser),
      orderBy: { batchId: "asc" },
      include: buildBatchInclude(),
    });

    res.json(jsonSafe(batches));
  } catch (error) {
    next(error);
  }
});

/** Creates a farm batch, QR, trace history and audit log for UC08-UC13 and UC29-UC31. */
apiRouter.post("/batches", authenticate, requireRole("ADMIN", "FARMER"), async (req: RequestWithUser, res, next) => {
  try {
    const {
      batchCode,
      productName,
      productType,
      quantity,
      harvestDate,
      packagedDate,
      expiryDate,
      status,
      location,
      notes,
      farmPartnerId,
    } = req.body as {
      batchCode?: string;
      productName?: string;
      productType?: string;
      quantity?: number | string;
      harvestDate?: string;
      packagedDate?: string;
      expiryDate?: string;
      status?: string;
      location?: string;
      notes?: string;
      farmPartnerId?: number | string;
    };

    const code = batchCode?.trim();
    const name = productName?.trim();
    const parsedQuantity = Number(quantity);
    const parsedHarvestDate = parseDateInput(harvestDate);
    const parsedPackagedDate = parseDateInput(packagedDate) ?? parsedHarvestDate;
    const parsedExpiryDate = parseDateInput(expiryDate);

    if (!code || !name || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      res.status(400).json({ message: "Missing batch information" });
      return;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (parsedHarvestDate && parsedHarvestDate > today) {
      res.status(400).json({ message: "Harvest date cannot be in the future" });
      return;
    }

    if (parsedHarvestDate && parsedPackagedDate && parsedPackagedDate < parsedHarvestDate) {
      res.status(400).json({ message: "Packaged date must be after harvest date" });
      return;
    }

    if (parsedPackagedDate && parsedExpiryDate && parsedExpiryDate <= parsedPackagedDate) {
      res.status(400).json({ message: "Expiry date must be after packaged date" });
      return;
    }

    const existingBatch = await prisma.batch.findUnique({
      where: { batchCode: code },
      select: { batchId: true },
    });

    if (existingBatch) {
      res.status(409).json({ message: "Batch code already exists" });
      return;
    }

    const requestedFarmPartnerId = Number(farmPartnerId);
    const resolvedFarmPartnerId = isAdmin(req.currentUser) && Number.isInteger(requestedFarmPartnerId)
      ? requestedFarmPartnerId
      : req.currentUser?.partnerId;

    const farmPartner = await prisma.partnerProfile.findFirst({
      where: {
        partnerId: resolvedFarmPartnerId ?? -1,
        partnerType: "FARM",
        cooperationStatus: "APPROVED",
      },
      select: { partnerId: true, partnerName: true, address: true },
    });

    if (!farmPartner) {
      res.status(400).json({ message: "A valid farm partner is required" });
      return;
    }

    const traceToken = createTraceToken();
    const qrUrl = `/trace/${traceToken}`;
    const batchStatus = normalizeBatchStatus(status);
    const auditContext = auditContextFromRequest(req);

    const batch = await prisma.$transaction(async (tx) => {
      const createdBatch = await tx.batch.create({
        data: {
          batchCode: code,
          productName: name,
          productType: productType?.trim() || null,
          quantity: parsedQuantity,
          currentQuantity: parsedQuantity,
          unit: "kg",
          harvestDate: parsedHarvestDate,
          packagedDate: parsedPackagedDate,
          expiryDate: parsedExpiryDate,
          farmingMethods: notes?.trim() || location?.trim() || null,
          farmPartnerId: farmPartner.partnerId,
          currentLocationPartnerId: farmPartner.partnerId,
          createdBy: req.currentUser?.accountId ?? null,
          status: batchStatus,
          qrCode: {
            create: {
              traceToken,
              qrUrl,
              qrImagePath: qrUrl,
              status: QrCodeStatus.ACTIVE,
            },
          },
        },
        include: buildBatchInclude(),
      });

      await appendBatchStatusHistory(tx, {
        batchId: createdBatch.batchId,
        status: batchStatus,
        locationName: farmPartner.partnerName ?? farmPartner.address,
        note: "Batch created",
        changedBy: req.currentUser?.accountId ?? null,
      });

      await appendAuditLog(tx, auditContext, {
        action: "BATCH_CREATED",
        objectType: "BATCH",
        objectId: createdBatch.batchId,
        newValue: createdBatch,
      });

      return createdBatch;
    });

    res.status(201).json(jsonSafe(batch));
  } catch (error) {
    next(error);
  }
});

/** Updates batch master data and audits the before/after state for UC09 and UC26-UC28. */
apiRouter.put("/batches/:batchCode", authenticate, requireRole("ADMIN", "FARMER"), async (req: RequestWithUser, res, next) => {
  try {
    const {
      batchCode,
      productName,
      productType,
      quantity,
      harvestDate,
      expiryDate,
      status,
      location,
      notes,
    } = req.body as {
      batchCode?: string;
      productName?: string;
      productType?: string;
      quantity?: number | string;
      harvestDate?: string;
      expiryDate?: string;
      status?: string;
      location?: string;
      notes?: string;
    };

    const code = batchCode?.trim();
    const name = productName?.trim();
    const parsedQuantity = Number(quantity);
    const parsedHarvestDate = parseDateInput(harvestDate);
    const parsedExpiryDate = parseDateInput(expiryDate);

    if (!code || !name || !Number.isFinite(parsedQuantity)) {
      res.status(400).json({ message: "Missing batch information" });
      return;
    }

    const existingBatch = await prisma.batch.findUnique({
      where: { batchCode: paramText(req.params.batchCode) },
      include: buildBatchInclude(),
    });

    if (!existingBatch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    if (!isAdmin(req.currentUser) && existingBatch.farmPartnerId !== req.currentUser?.partnerId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const duplicateBatchCode = await prisma.batch.findUnique({
      where: { batchCode: code },
      select: { batchId: true },
    });

    if (duplicateBatchCode && duplicateBatchCode.batchId !== existingBatch.batchId) {
      res.status(409).json({ message: "Batch code already exists" });
      return;
    }

    const nextStatus = normalizeBatchStatus(status);
    const updatedBatch = await prisma.$transaction(async (tx) => {
      const nextBatch = await tx.batch.update({
        where: { batchId: existingBatch.batchId },
        data: {
          batchCode: code,
          productName: name,
          productType: productType?.trim() || null,
          quantity: parsedQuantity,
          harvestDate: parsedHarvestDate,
          expiryDate: parsedExpiryDate,
          farmingMethods: notes?.trim() || location?.trim() || null,
          status: nextStatus,
        },
        include: buildBatchInclude(),
      });

      if (existingBatch.status !== nextStatus) {
        await appendBatchStatusHistory(tx, {
          batchId: existingBatch.batchId,
          status: nextStatus,
          locationName: location?.trim() || existingBatch.farmPartner?.address || null,
          note: notes?.trim() || "Batch status updated",
          changedBy: req.currentUser?.accountId ?? null,
        });
      }

      await appendAuditLog(tx, auditContextFromRequest(req), {
        action: nextStatus === PrismaBatchStatus.CANCELLED ? "BATCH_CANCELLED" : "BATCH_UPDATED",
        objectType: "BATCH",
        objectId: existingBatch.batchId,
        oldValue: existingBatch,
        newValue: nextBatch,
      });

      return nextBatch;
    });

    res.json(jsonSafe(updatedBatch));
  } catch (error) {
    next(error);
  }
});

/** Adds a certificate to a batch and audits the change for UC14-UC18 and UC26-UC28. */
apiRouter.post("/batches/:batchCode/certificates", authenticate, requireRole("ADMIN", "FARMER"), async (req: RequestWithUser, res, next) => {
  try {
    const { name, issuer, issuedDate, expiryDate, status, filePath } = req.body as {
      name?: string;
      issuer?: string;
      issuedDate?: string;
      expiryDate?: string;
      status?: string;
      filePath?: string;
    };

    const batch = await prisma.batch.findUnique({
      where: { batchCode: paramText(req.params.batchCode) },
      select: { batchId: true, farmPartnerId: true },
    });

    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    if (!isAdmin(req.currentUser) && batch.farmPartnerId !== req.currentUser?.partnerId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const parsedIssuedDate = parseDateInput(issuedDate);
    const parsedExpiryDate = parseDateInput(expiryDate);

    if (!name?.trim() || !issuer?.trim() || !parsedIssuedDate || !parsedExpiryDate) {
      res.status(400).json({ message: "Missing certificate information" });
      return;
    }

    const certificate = await prisma.$transaction(async (tx) => {
      const createdCertificate = await tx.certificate.create({
        data: {
          issuerPartnerId: batch.farmPartnerId,
          certType: normalizeCertificateType(name),
          issuedBy: issuer.trim(),
          issuedDate: parsedIssuedDate,
          expiryDate: parsedExpiryDate,
          filePath: filePath?.trim() || null,
          status: normalizeCertificateStatus(status),
          batches: {
            create: {
              batchId: batch.batchId,
            },
          },
        },
      });

      await appendAuditLog(tx, auditContextFromRequest(req), {
        action: "CERTIFICATE_CREATED",
        objectType: "CERTIFICATE",
        objectId: createdCertificate.certificateId,
        newValue: createdCertificate,
      });

      return createdCertificate;
    });

    res.status(201).json(jsonSafe(certificate));
  } catch (error) {
    next(error);
  }
});

/** Updates certificate metadata and writes audit log for UC16 and UC26-UC28. */
apiRouter.put("/certificates/:certificateId", authenticate, requireRole("ADMIN", "FARMER"), async (req: RequestWithUser, res, next) => {
  try {
    const certificateId = Number(req.params.certificateId);

    if (!Number.isInteger(certificateId)) {
      res.status(400).json({ message: "certificateId must be an integer" });
      return;
    }

    const { name, issuer, issuedDate, expiryDate, status, filePath } = req.body as {
      name?: string;
      issuer?: string;
      issuedDate?: string;
      expiryDate?: string;
      status?: string;
      filePath?: string;
    };

    const parsedIssuedDate = parseDateInput(issuedDate);
    const parsedExpiryDate = parseDateInput(expiryDate);

    if (!name?.trim() || !issuer?.trim() || !parsedIssuedDate || !parsedExpiryDate) {
      res.status(400).json({ message: "Missing certificate information" });
      return;
    }

    const oldCertificate = await prisma.certificate.findUnique({
      where: { certificateId },
      include: { batches: { include: { batch: true } } },
    });

    if (!oldCertificate) {
      res.status(404).json({ message: "Certificate not found" });
      return;
    }

    const ownsCertificate = oldCertificate.batches.some((link) => link.batch.farmPartnerId === req.currentUser?.partnerId);
    if (!isAdmin(req.currentUser) && !ownsCertificate) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const certificate = await prisma.$transaction(async (tx) => {
      const updatedCertificate = await tx.certificate.update({
        where: { certificateId },
        data: {
          certType: normalizeCertificateType(name),
          issuedBy: issuer.trim(),
          issuedDate: parsedIssuedDate,
          expiryDate: parsedExpiryDate,
          filePath: filePath?.trim() || null,
          status: normalizeCertificateStatus(status),
        },
      });

      await appendAuditLog(tx, auditContextFromRequest(req), {
        action: "CERTIFICATE_UPDATED",
        objectType: "CERTIFICATE",
        objectId: certificateId,
        oldValue: oldCertificate,
        newValue: updatedCertificate,
      });

      return updatedCertificate;
    });

    res.json(jsonSafe(certificate));
  } catch (error) {
    next(error);
  }
});

/** Unlinks a certificate without physical deletion for UC17 historical traceability. */
apiRouter.delete("/batches/:batchCode/certificates/:certificateId", authenticate, requireRole("ADMIN", "FARMER"), async (req: RequestWithUser, res, next) => {
  try {
    const certificateId = Number(req.params.certificateId);

    if (!Number.isInteger(certificateId)) {
      res.status(400).json({ message: "certificateId must be an integer" });
      return;
    }

    const batch = await prisma.batch.findUnique({
      where: { batchCode: paramText(req.params.batchCode) },
      select: { batchId: true, farmPartnerId: true },
    });

    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    if (!isAdmin(req.currentUser) && batch.farmPartnerId !== req.currentUser?.partnerId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.batchCert.delete({
        where: {
          batchId_certificateId: {
            batchId: batch.batchId,
            certificateId,
          },
        },
      });

      const remainingLinks = await tx.batchCert.count({ where: { certificateId } });
      if (remainingLinks === 0) {
        await tx.certificate.update({
          where: { certificateId },
          data: { status: CertificateStatus.REVOKED },
        });
      }

      await appendAuditLog(tx, auditContextFromRequest(req), {
        action: "CERTIFICATE_UNLINKED",
        objectType: "CERTIFICATE",
        objectId: certificateId,
        oldValue: { batchId: batch.batchId, certificateId },
      });
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/** Shows protected batch detail for UC13 with role-based data ownership. */
apiRouter.get("/batches/:batchCode", authenticate, async (req: RequestWithUser, res, next) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { batchCode: paramText(req.params.batchCode) },
      include: {
        farmPartner: true,
        certificates: {
          include: {
            certificate: true,
          },
        },
        transport: {
          include: {
            checkpoints: { orderBy: { sequence: "asc" } },
            incidents: true,
            shipperPartner: true,
            receiverPartner: true,
          },
        },
        qrCode: true,
      },
    });

    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    const batchTransport = (batch as typeof batch & {
      transport?: {
        storePartnerId?: number | null;
        receiverPartnerId?: number | null;
        transporterPartnerId?: number | null;
      } | null;
    }).transport;

    const canRead = isAdmin(req.currentUser)
      || batch.farmPartnerId === req.currentUser?.partnerId
      || batchTransport?.storePartnerId === req.currentUser?.partnerId
      || batchTransport?.receiverPartnerId === req.currentUser?.partnerId
      || batchTransport?.transporterPartnerId === req.currentUser?.partnerId
      || req.currentUser?.role === "INSPECTOR";

    if (!canRead) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.json(jsonSafe(batch));
  } catch (error) {
    next(error);
  }
});

/** Lists transport orders with partner ownership scope for UC19. */
apiRouter.get("/transports", authenticate, requireRole("ADMIN", "FARMER", "STORE", "WAREHOUSE", "TRANSPORTER"), async (req: RequestWithUser, res, next) => {
  try {
    const transports = await prisma.transport.findMany({
      where: transportWhereForUser(req.currentUser),
      orderBy: { transportId: "asc" },
      include: buildTransportInclude(),
    });

    res.json(jsonSafe(transports));
  } catch (error) {
    next(error);
  }
});

/** Assigns transport and writes batch history/audit for UC20 and UC26-UC28. */
apiRouter.post("/batches/:batchCode/assign-transport", authenticate, requireRole("ADMIN", "FARMER"), async (req: RequestWithUser, res, next) => {
  try {
    const { driverAccountId, driverName, receiverPartnerId, transporterPartnerId, licensePlate, expectedArrivalTime } = req.body as {
      driverAccountId?: number | string;
      driverName?: string;
      receiverPartnerId?: number | string;
      transporterPartnerId?: number | string;
      licensePlate?: string;
      expectedArrivalTime?: string;
    };

    const parsedDriverAccountId = Number(driverAccountId);
    const driver = Number.isInteger(parsedDriverAccountId)
      ? await prisma.account.findFirst({
          where: {
            accountId: parsedDriverAccountId,
            role: "TRANSPORTER",
            status: "ACTIVE",
          },
          select: {
            fullName: true,
            partnerId: true,
          },
        })
      : null;
    const name = driver?.fullName ?? driverName?.trim();

    if (!name) {
      res.status(400).json({ message: "A valid transporter account is required" });
      return;
    }

    const batch = await prisma.batch.findUnique({
      where: { batchCode: paramText(req.params.batchCode) },
      include: {
        farmPartner: true,
        transport: true,
      },
    });

    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    if (!isAdmin(req.currentUser) && batch.farmPartnerId !== req.currentUser?.partnerId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (batch.status !== PrismaBatchStatus.AT_WAREHOUSE && batch.status !== PrismaBatchStatus.IN_TRANSIT) {
      res.status(409).json({ message: "Batch must be ready before assigning transport" });
      return;
    }

    const existingTransport = (batch as typeof batch & {
      transport?: {
        transportId: number;
        receiverPartnerId: number | null;
        actualDeparture: Date | null;
      } | null;
    }).transport;

    const parsedReceiverPartnerId = Number(receiverPartnerId);
    const receiverPartner = Number.isInteger(parsedReceiverPartnerId)
      ? await prisma.partnerProfile.findFirst({
          where: {
            partnerId: parsedReceiverPartnerId,
            partnerType: "STORE",
            cooperationStatus: "APPROVED",
          },
          select: { partnerId: true },
        })
      : await prisma.partnerProfile.findFirst({
          where: { partnerType: "STORE" },
          orderBy: { partnerId: "asc" },
          select: { partnerId: true },
        });

    if (!receiverPartner) {
      res.status(400).json({ message: "A valid destination store is required" });
      return;
    }

    const parsedTransporterPartnerId = Number(transporterPartnerId);
    const resolvedTransporterPartnerId = Number.isInteger(parsedTransporterPartnerId)
      ? parsedTransporterPartnerId
      : driver?.partnerId;
    const transporterPartnerIdValue = typeof resolvedTransporterPartnerId === "number" && Number.isInteger(resolvedTransporterPartnerId)
      ? resolvedTransporterPartnerId
      : null;

    const transporterPartner = transporterPartnerIdValue !== null
      ? await prisma.partnerProfile.findFirst({
          where: {
            partnerId: transporterPartnerIdValue,
            partnerType: "TRANSPORT_COMPANY",
            cooperationStatus: "APPROVED",
          },
          select: { partnerId: true, partnerName: true },
        })
      : null;

    if (!transporterPartner) {
      res.status(400).json({ message: "A valid transporter partner is required" });
      return;
    }

    const expectedArrival = parseDateInput(expectedArrivalTime);

    const assignedTransport = await prisma.$transaction(async (tx) => {
      await tx.batch.update({
        where: { batchId: batch.batchId },
        data: {
          status: PrismaBatchStatus.IN_TRANSIT,
          currentLocationPartnerId: transporterPartner.partnerId,
        },
      });

      const transport = existingTransport
        ? await tx.transport.update({
            where: { transportId: existingTransport.transportId },
            data: {
              shipperPartnerId: batch.farmPartnerId,
              farmPartnerId: batch.farmPartnerId,
              receiverPartnerId: receiverPartner?.partnerId ?? existingTransport.receiverPartnerId,
              storePartnerId: receiverPartner?.partnerId ?? existingTransport.receiverPartnerId,
              transporterPartnerId: transporterPartner.partnerId,
              driverName: name,
              licensePlate: normalizeOptionalText(licensePlate),
              transportStatus: TransportStatus.IN_TRANSIT,
              actualDeparture: existingTransport.actualDeparture ?? new Date(),
              expectedArrival,
            },
            include: buildTransportInclude(),
          })
        : await tx.transport.create({
            data: {
              batchId: batch.batchId,
              shipperPartnerId: batch.farmPartnerId,
              farmPartnerId: batch.farmPartnerId,
              receiverPartnerId: receiverPartner?.partnerId ?? null,
              storePartnerId: receiverPartner?.partnerId ?? null,
              transporterPartnerId: transporterPartner.partnerId,
              driverName: name,
              licensePlate: normalizeOptionalText(licensePlate),
              transportStatus: TransportStatus.IN_TRANSIT,
              actualDeparture: new Date(),
              expectedArrival,
              createdBy: req.currentUser?.accountId ?? null,
            },
            include: buildTransportInclude(),
          });

      const firstCheckpoint = await tx.transportCheckpoint.findFirst({
        where: {
          transportId: transport.transportId,
          sequence: 1,
        },
        select: { checkpointId: true },
      });

      if (!firstCheckpoint) {
        await tx.transportCheckpoint.create({
          data: {
            transportId: transport.transportId,
            sequence: 1,
            locationName: "Điểm nhận hàng",
            reportedAt: new Date(),
          },
          });
      }

      await appendBatchStatusHistory(tx, {
        batchId: batch.batchId,
        status: PrismaBatchStatus.IN_TRANSIT,
        locationName: transporterPartner.partnerName,
        note: "Transport assigned",
        changedBy: req.currentUser?.accountId ?? null,
      });

      await appendAuditLog(tx, auditContextFromRequest(req), {
        action: "TRANSPORT_ASSIGNED",
        objectType: "TRANSPORT",
        objectId: transport.transportId,
        newValue: transport,
      });

      return tx.transport.findUniqueOrThrow({
        where: { transportId: transport.transportId },
        include: buildTransportInclude(),
      });
    });

    res.status(201).json(jsonSafe(assignedTransport));
  } catch (error) {
    next(error);
  }
});

/** Lists checkpoints for a transport within UC23 ownership scope. */
apiRouter.get("/transports/:transportId/checkpoints", authenticate, async (req: RequestWithUser, res, next) => {
  try {
    const transportId = Number(req.params.transportId);

    if (!Number.isInteger(transportId)) {
      res.status(400).json({ message: "transportId must be an integer" });
      return;
    }

    const transport = await prisma.transport.findFirst({
      where: {
        transportId,
        ...transportWhereForUser(req.currentUser),
      },
      select: { transportId: true },
    });

    if (!transport) {
      res.status(404).json({ message: "Transport not found" });
      return;
    }

    const checkpoints = await prisma.transportCheckpoint.findMany({
      where: { transportId },
      orderBy: { sequence: "asc" },
    });

    res.json(jsonSafe(checkpoints));
  } catch (error) {
    next(error);
  }
});

/** Creates a checkpoint for the assigned transporter and audits UC21 changes. */
apiRouter.post("/transports/:transportId/checkpoints", authenticate, requireRole("ADMIN", "TRANSPORTER"), async (req: RequestWithUser, res, next) => {
  try {
    const transportId = Number(req.params.transportId);

    if (!Number.isInteger(transportId)) {
      res.status(400).json({ message: "transportId must be an integer" });
      return;
    }

    const transport = await prisma.transport.findFirst({
      where: {
        transportId,
        ...transportWhereForUser(req.currentUser),
      },
      include: {
        batch: true,
        transporterPartner: true,
      },
    });

    if (!transport) {
      res.status(404).json({ message: "Transport not found" });
      return;
    }

    const requestedSequence = Number(req.body?.sequence);
    const lastCheckpoint = await prisma.transportCheckpoint.findFirst({
      where: { transportId },
      orderBy: { sequence: "desc" },
      select: { sequence: true },
    });

    const checkpoint = await prisma.$transaction(async (tx) => {
      const createdCheckpoint = await tx.transportCheckpoint.create({
        data: {
          transportId,
          sequence: Number.isInteger(requestedSequence) && requestedSequence > 0
            ? requestedSequence
            : (lastCheckpoint?.sequence ?? 0) + 1,
          locationName: normalizeOptionalText(req.body?.locationName),
          latitude: parseOptionalNumber(req.body?.latitude),
          longitude: parseOptionalNumber(req.body?.longitude),
          temperature: parseOptionalNumber(req.body?.temperature),
          statusAtCheckpoint: normalizeOptionalText(req.body?.statusAtCheckpoint),
          note: normalizeOptionalText(req.body?.note),
          reportedAt: new Date(),
        },
      });

      if (req.body?.arrivedWarehouse === true) {
        await tx.transport.update({
          where: { transportId },
          data: {
            transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
            actualArrival: new Date(),
          },
        });

        if (transport.batchId) {
          await appendBatchStatusHistory(tx, {
            batchId: transport.batchId,
            status: PrismaBatchStatus.IN_TRANSIT,
            locationName: createdCheckpoint.locationName,
            note: "Transport checkpoint arrived",
            changedBy: req.currentUser?.accountId ?? null,
          });
        }
      }

      await appendAuditLog(tx, auditContextFromRequest(req), {
        action: "TRANSPORT_CHECKPOINT_CREATED",
        objectType: "TRANSPORT_CHECKPOINT",
        objectId: createdCheckpoint.checkpointId,
        newValue: createdCheckpoint,
      });

      return createdCheckpoint;
    });

    res.status(201).json(jsonSafe(checkpoint));
  } catch (error) {
    next(error);
  }
});

/** Updates a checkpoint for the assigned transporter and audits UC21 changes. */
apiRouter.put("/transports/:transportId/checkpoints/:checkpointId", authenticate, requireRole("ADMIN", "TRANSPORTER"), async (req: RequestWithUser, res, next) => {
  try {
    const body = req.body ?? {};
    const transportId = Number(req.params.transportId);
    const checkpointId = Number(req.params.checkpointId);

    if (!Number.isInteger(transportId) || !Number.isInteger(checkpointId)) {
      res.status(400).json({ message: "transportId and checkpointId must be integers" });
      return;
    }

    const transport = await prisma.transport.findFirst({
      where: {
        transportId,
        ...transportWhereForUser(req.currentUser),
      },
      select: { transportId: true, batchId: true },
    });

    if (!transport) {
      res.status(404).json({ message: "Transport not found" });
      return;
    }

    const checkpoint = await prisma.transportCheckpoint.findFirst({
      where: { checkpointId, transportId },
    });

    if (!checkpoint) {
      res.status(404).json({ message: "Checkpoint not found" });
      return;
    }

    const checkpointData: {
      locationName?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      temperature?: number | null;
      statusAtCheckpoint?: string | null;
      note?: string | null;
      reportedAt: Date;
    } = { reportedAt: new Date() };

    if ("locationName" in body) checkpointData.locationName = normalizeOptionalText(body.locationName);
    if ("latitude" in body) checkpointData.latitude = parseOptionalNumber(body.latitude);
    if ("longitude" in body) checkpointData.longitude = parseOptionalNumber(body.longitude);
    if ("temperature" in body) checkpointData.temperature = parseOptionalNumber(body.temperature);
    if ("statusAtCheckpoint" in body) checkpointData.statusAtCheckpoint = normalizeOptionalText(body.statusAtCheckpoint);
    if ("note" in body) checkpointData.note = normalizeOptionalText(body.note);

    const updatedCheckpoint = await prisma.$transaction(async (tx) => {
      const nextCheckpoint = await tx.transportCheckpoint.update({
        where: { checkpointId },
        data: checkpointData,
      });

      if (body.arrivedWarehouse === true) {
        await tx.transport.update({
          where: { transportId },
          data: {
            transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
            actualArrival: new Date(),
          },
        });

        if (transport.batchId) {
          await appendBatchStatusHistory(tx, {
            batchId: transport.batchId,
            status: PrismaBatchStatus.IN_TRANSIT,
            locationName: nextCheckpoint.locationName,
            note: "Transport checkpoint updated",
            changedBy: req.currentUser?.accountId ?? null,
          });
        }
      }

      await appendAuditLog(tx, auditContextFromRequest(req), {
        action: "TRANSPORT_CHECKPOINT_UPDATED",
        objectType: "TRANSPORT_CHECKPOINT",
        objectId: checkpointId,
        oldValue: checkpoint,
        newValue: nextCheckpoint,
      });

      return nextCheckpoint;
    });

    res.json(jsonSafe(updatedCheckpoint));
  } catch (error) {
    next(error);
  }
});

/** Lists store deliveries scoped to the current store for UC24. */
apiRouter.get("/store/deliveries", authenticate, requireRole("ADMIN", "STORE", "WAREHOUSE"), async (req: RequestWithUser, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const statusWhere = status === "pending"
      ? {
          transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
          incidents: { none: {} },
        }
      : status === "delivered"
        ? { transportStatus: TransportStatus.DELIVERED }
        : {};

    const deliveries = await prisma.transport.findMany({
      where: {
        ...statusWhere,
        ...transportWhereForUser(req.currentUser),
      },
      orderBy: { transportId: "asc" },
      include: buildStoreDeliveryInclude(),
    });

    res.json(jsonSafe(deliveries));
  } catch (error) {
    next(error);
  }
});

/** Confirms store delivery and writes status history/audit for UC24. */
apiRouter.post("/store/deliveries/:batchCode/confirm", authenticate, requireRole("ADMIN", "STORE", "WAREHOUSE"), async (req: RequestWithUser, res, next) => {
  try {
    const delivery = await prisma.transport.findFirst({
      where: {
        transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
        incidents: { none: {} },
        batch: {
          batchCode: paramText(req.params.batchCode),
        },
        ...transportWhereForUser(req.currentUser),
      },
      select: {
        transportId: true,
        batchId: true,
        storePartnerId: true,
        receiverPartnerId: true,
      },
    });

    if (!delivery) {
      res.status(404).json({ message: "Delivery not found or not waiting for confirmation" });
      return;
    }

    const confirmedDelivery = await prisma.$transaction(async (tx) => {
      if (delivery.batchId) {
        await tx.batch.update({
          where: { batchId: delivery.batchId },
          data: {
            status: PrismaBatchStatus.DELIVERED,
            currentLocationPartnerId: delivery.storePartnerId ?? delivery.receiverPartnerId,
          },
        });

        await appendBatchStatusHistory(tx, {
          batchId: delivery.batchId,
          status: PrismaBatchStatus.DELIVERED,
          locationName: "Store received delivery",
          note: "Delivery confirmed by store",
          changedBy: req.currentUser?.accountId ?? null,
        });
      }

      const nextDelivery = await tx.transport.update({
        where: { transportId: delivery.transportId },
        data: {
          transportStatus: TransportStatus.DELIVERED,
          actualArrival: new Date(),
          deliveryConfirmedBy: req.currentUser?.accountId ?? null,
        },
        include: buildStoreDeliveryInclude(),
      });

      await appendAuditLog(tx, auditContextFromRequest(req), {
        action: "DELIVERY_CONFIRMED",
        objectType: "TRANSPORT",
        objectId: delivery.transportId,
        newValue: nextDelivery,
      });

      return nextDelivery;
    });

    res.json(jsonSafe(confirmedDelivery));
  } catch (error) {
    next(error);
  }
});

/** Reports delivery issue and updates batch/transport status for UC25. */
apiRouter.post("/store/deliveries/:batchCode/issues", authenticate, requireRole("ADMIN", "STORE", "WAREHOUSE"), async (req: RequestWithUser, res, next) => {
  try {
    const quantityAffected = Number(req.body?.quantityAffected);

    const delivery = await prisma.transport.findFirst({
      where: {
        transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
        batch: {
          batchCode: paramText(req.params.batchCode),
        },
        ...transportWhereForUser(req.currentUser),
      },
      select: {
        transportId: true,
        batchId: true,
      },
    });

    if (!delivery) {
      res.status(404).json({ message: "Delivery not found or not waiting for confirmation" });
      return;
    }

    const issue = await prisma.$transaction(async (tx) => {
      const createdIssue = await tx.incident.create({
        data: {
          transportId: delivery.transportId,
          batchId: delivery.batchId,
          reportedBy: req.currentUser?.accountId ?? null,
          incidentType: normalizeIncidentType(req.body?.incidentType),
          description: typeof req.body?.description === "string" ? req.body.description.trim() || null : null,
          quantityAffected: Number.isFinite(quantityAffected) ? quantityAffected : null,
          photoPath: typeof req.body?.photoPath === "string" ? req.body.photoPath.trim() || null : null,
        },
        include: {
          batch: {
            include: {
              farmPartner: true,
            },
          },
          transport: {
            include: {
              shipperPartner: true,
              receiverPartner: true,
            },
          },
          reporter: {
            select: {
              accountId: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      if (delivery.batchId) {
        await tx.batch.update({
          where: { batchId: delivery.batchId },
          data: { status: PrismaBatchStatus.INCIDENT_REPORTED },
        });

        await appendBatchStatusHistory(tx, {
          batchId: delivery.batchId,
          status: PrismaBatchStatus.INCIDENT_REPORTED,
          locationName: "Store reported issue",
          note: createdIssue.description,
          changedBy: req.currentUser?.accountId ?? null,
        });
      }

      await tx.transport.update({
        where: { transportId: delivery.transportId },
        data: { transportStatus: TransportStatus.INCIDENT_REPORTED },
      });

      await appendAuditLog(tx, auditContextFromRequest(req), {
        action: "INCIDENT_REPORTED",
        objectType: "INCIDENT",
        objectId: createdIssue.incidentId,
        newValue: createdIssue,
      });

      return createdIssue;
    });

    res.status(201).json(jsonSafe(issue));
  } catch (error) {
    next(error);
  }
});

/** Lists store issues within current store scope for UC25. */
apiRouter.get("/store/issues", authenticate, requireRole("ADMIN", "STORE", "WAREHOUSE"), async (req: RequestWithUser, res, next) => {
  try {
    const issues = await prisma.incident.findMany({
      where: {
        transport: {
          transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
          ...transportWhereForUser(req.currentUser),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        batch: {
          include: {
            farmPartner: true,
          },
        },
        transport: {
          include: {
            shipperPartner: true,
            receiverPartner: true,
          },
        },
        reporter: {
          select: {
            accountId: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    res.json(jsonSafe(issues));
  } catch (error) {
    next(error);
  }
});

/** Returns safe public trace data by trace token and logs QR scan for UC29-UC31. */
apiRouter.get("/trace/:traceToken", async (req, res, next) => {
  try {
    const traceToken = req.params.traceToken?.trim();
    if (!traceToken) {
      res.status(400).json({ message: "traceToken is required" });
      return;
    }

    const qrCode = await prisma.qrCode.findUnique({
      where: { traceToken },
      include: {
        batch: {
          include: {
            farmPartner: {
              select: {
                partnerName: true,
                address: true,
              },
            },
            certificates: {
              include: {
                certificate: {
                  select: {
                    certificateId: true,
                    certType: true,
                    issuedBy: true,
                    issuedDate: true,
                    expiryDate: true,
                    status: true,
                    filePath: true,
                  },
                },
              },
            },
            statusHistory: {
              orderBy: { changedAt: "asc" },
              select: {
                status: true,
                locationName: true,
                note: true,
                changedAt: true,
              },
            },
          },
        },
      },
    });

    if (!qrCode || !qrCode.batchId || !qrCode.batch) {
      res.status(404).json({ message: "Trace not found" });
      return;
    }

    if (qrCode.status !== QrCodeStatus.ACTIVE) {
      await prisma.qrScanLog.create({
        data: {
          qrId: qrCode.qrId,
          batchId: qrCode.batchId,
          ipAddress: req.ip,
          userAgent: req.get("user-agent") ?? null,
          referer: req.get("referer") ?? null,
          scanResult: "INACTIVE",
        },
      });
      res.status(410).json({ message: "QR code is inactive" });
      return;
    }

    await prisma.qrScanLog.create({
      data: {
        qrId: qrCode.qrId,
        batchId: qrCode.batchId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? null,
        referer: req.get("referer") ?? null,
        scanResult: "SUCCESS",
      },
    });

    res.json(
      jsonSafe({
        batch: {
          batchCode: qrCode.batch.batchCode,
          productName: qrCode.batch.productName,
          productType: qrCode.batch.productType,
          farmingMethods: qrCode.batch.farmingMethods,
          quantity: qrCode.batch.quantity,
          unit: qrCode.batch.unit,
          harvestDate: qrCode.batch.harvestDate,
          packagedDate: qrCode.batch.packagedDate,
          expiryDate: qrCode.batch.expiryDate,
          status: qrCode.batch.status,
        },
        origin: qrCode.batch.farmPartner,
        certificates: qrCode.batch.certificates.map((item) => item.certificate),
        timeline: qrCode.batch.statusHistory,
        qr: {
          traceToken: qrCode.traceToken,
          status: qrCode.status,
          createdAt: qrCode.createdAt,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
});

/** Returns protected QR metadata for UC29-UC31 administration. */
apiRouter.get("/qr/:qrId", authenticate, async (req: RequestWithUser, res, next) => {
  try {
    const qrId = Number(req.params.qrId);

    if (!Number.isInteger(qrId)) {
      res.status(400).json({ message: "qrId must be an integer" });
      return;
    }

    const qrCode = await prisma.qrCode.findUnique({
      where: { qrId },
      include: {
        batch: {
          include: {
            farmPartner: true,
            certificates: {
              include: {
                certificate: true,
              },
            },
          },
        },
      },
    });

    if (!qrCode) {
      res.status(404).json({ message: "QR code not found" });
      return;
    }

    if (!isAdmin(req.currentUser) && qrCode.batch?.farmPartnerId !== req.currentUser?.partnerId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.json(jsonSafe(qrCode));
  } catch (error) {
    next(error);
  }
});
