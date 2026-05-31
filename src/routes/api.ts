import { Router } from "express";
import { prisma } from "../lib/prisma.ts";
import { jsonSafe } from "../utils/json.ts";
import {
  BatchStatus as PrismaBatchStatus,
  CertificateStatus,
  CertificateType,
  QrCodeStatus,
  TransportStatus,
} from "../generated/prisma/enums.ts";

export const apiRouter = Router();

const loginRoleMap = {
  farm: ["FARMER"],
  store: ["STORE", "WAREHOUSE"],
  transporter: ["TRANSPORTER"],
  inspector: ["INSPECTOR"],
} as const;

function accountRoleMatchesLoginRole(accountRole: string, loginRole: keyof typeof loginRoleMap) {
  return loginRoleMap[loginRole].some((allowedRole) => allowedRole === accountRole);
}

const certificateTypes = new Set(Object.values(CertificateType));

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
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: keyof typeof loginRoleMap;
    };

    const identifier = email?.trim();
    if (!identifier || !password || !role || !loginRoleMap[role]) {
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
        status: true,
      },
    });

    if (!account || account.passwordHash !== password || !accountRoleMatchesLoginRole(account.role, role)) {
      res.status(401).json({ message: "Invalid username, password, or role" });
      return;
    }

    if (account.status !== "ACTIVE") {
      res.status(403).json({ message: "Account is locked" });
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
          role,
          status: "active",
        },
      }),
    );
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/accounts", async (_req, res, next) => {
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

apiRouter.get("/partners", async (_req, res, next) => {
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

apiRouter.get("/batches", async (_req, res, next) => {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { batchId: "asc" },
      include: buildBatchInclude(),
    });

    res.json(jsonSafe(batches));
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/batches", async (req, res, next) => {
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

    const farmPartner = await prisma.partnerProfile.findFirst({
      where: { partnerType: "FARM" },
      orderBy: { partnerId: "asc" },
      select: { partnerId: true },
    });

    const batch = await prisma.batch.create({
      data: {
        batchCode: code,
        productName: name,
        productType: productType?.trim() || null,
        quantity: parsedQuantity,
        unit: "kg",
        harvestDate: parsedHarvestDate,
        expiryDate: parsedExpiryDate,
        farmingMethods: notes?.trim() || location?.trim() || null,
        farmPartnerId: farmPartner?.partnerId ?? null,
        status: normalizeBatchStatus(status),
        qrCode: {
          create: {
            qrImagePath: `/trace/${encodeURIComponent(code)}`,
            status: QrCodeStatus.ACTIVE,
          },
        },
      },
      include: buildBatchInclude(),
    });

    res.status(201).json(jsonSafe(batch));
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/batches/:batchCode/certificates", async (req, res, next) => {
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
      where: { batchCode: req.params.batchCode },
      select: { batchId: true, farmPartnerId: true },
    });

    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    const parsedIssuedDate = parseDateInput(issuedDate);
    const parsedExpiryDate = parseDateInput(expiryDate);

    if (!name?.trim() || !issuer?.trim() || !parsedIssuedDate || !parsedExpiryDate) {
      res.status(400).json({ message: "Missing certificate information" });
      return;
    }

    const certificate = await prisma.certificate.create({
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

    res.status(201).json(jsonSafe(certificate));
  } catch (error) {
    next(error);
  }
});

apiRouter.put("/certificates/:certificateId", async (req, res, next) => {
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

    const certificate = await prisma.certificate.update({
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

    res.json(jsonSafe(certificate));
  } catch (error) {
    next(error);
  }
});

apiRouter.delete("/batches/:batchCode/certificates/:certificateId", async (req, res, next) => {
  try {
    const certificateId = Number(req.params.certificateId);

    if (!Number.isInteger(certificateId)) {
      res.status(400).json({ message: "certificateId must be an integer" });
      return;
    }

    const batch = await prisma.batch.findUnique({
      where: { batchCode: req.params.batchCode },
      select: { batchId: true },
    });

    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    await prisma.batchCert.delete({
      where: {
        batchId_certificateId: {
          batchId: batch.batchId,
          certificateId,
        },
      },
    });

    const remainingLinks = await prisma.batchCert.count({ where: { certificateId } });
    if (remainingLinks === 0) {
      await prisma.certificate.delete({ where: { certificateId } });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/batches/:batchCode", async (req, res, next) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { batchCode: req.params.batchCode },
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

    res.json(jsonSafe(batch));
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/transports", async (_req, res, next) => {
  try {
    const transports = await prisma.transport.findMany({
      orderBy: { transportId: "asc" },
      include: {
        batch: true,
        shipperPartner: true,
        receiverPartner: true,
        checkpoints: { orderBy: { sequence: "asc" } },
      },
    });

    res.json(jsonSafe(transports));
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/store/deliveries", async (_req, res, next) => {
  try {
    const deliveries = await prisma.transport.findMany({
      orderBy: { transportId: "asc" },
      include: buildStoreDeliveryInclude(),
    });

    res.json(jsonSafe(deliveries));
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/store/deliveries/:batchCode/confirm", async (req, res, next) => {
  try {
    const accountId = Number(req.body?.accountId);

    const delivery = await prisma.transport.findFirst({
      where: {
        batch: {
          batchCode: req.params.batchCode,
        },
      },
      select: {
        transportId: true,
        batchId: true,
      },
    });

    if (!delivery) {
      res.status(404).json({ message: "Delivery not found" });
      return;
    }

    const confirmedDelivery = await prisma.$transaction(async (tx) => {
      if (delivery.batchId) {
        await tx.batch.update({
          where: { batchId: delivery.batchId },
          data: { status: PrismaBatchStatus.DELIVERED },
        });
      }

      return tx.transport.update({
        where: { transportId: delivery.transportId },
        data: {
          transportStatus: TransportStatus.DELIVERED,
          actualArrival: new Date(),
          deliveryConfirmedBy: Number.isInteger(accountId) ? accountId : null,
        },
        include: buildStoreDeliveryInclude(),
      });
    });

    res.json(jsonSafe(confirmedDelivery));
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/store/issues", async (_req, res, next) => {
  try {
    const issues = await prisma.incident.findMany({
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

apiRouter.get("/qr/:qrId", async (req, res, next) => {
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

    res.json(jsonSafe(qrCode));
  } catch (error) {
    next(error);
  }
});
