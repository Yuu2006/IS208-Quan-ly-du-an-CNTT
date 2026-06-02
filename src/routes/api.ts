import { Router } from "express";
import { prisma } from "../lib/prisma.ts";
import { jsonSafe } from "../utils/json.ts";
import {
  BatchStatus as PrismaBatchStatus,
  CertificateStatus,
  CertificateType,
  IncidentType,
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
const incidentTypes = new Set(Object.values(IncidentType));

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

async function markTransportArrivedWarehouse(transportId: number) {
  await prisma.transport.update({
    where: { transportId },
    data: {
      transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
      actualArrival: new Date(),
    },
  });
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

apiRouter.get("/transporters", async (_req, res, next) => {
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

apiRouter.get("/stores", async (_req, res, next) => {
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

    const existingBatch = await prisma.batch.findUnique({
      where: { batchCode: code },
      select: { batchId: true },
    });

    if (existingBatch) {
      res.status(409).json({ message: "Batch code already exists" });
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

apiRouter.put("/batches/:batchCode", async (req, res, next) => {
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
      where: { batchCode: req.params.batchCode },
      select: { batchId: true },
    });

    if (!existingBatch) {
      res.status(404).json({ message: "Batch not found" });
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

    const updatedBatch = await prisma.batch.update({
      where: { batchId: existingBatch.batchId },
      data: {
        batchCode: code,
        productName: name,
        productType: productType?.trim() || null,
        quantity: parsedQuantity,
        harvestDate: parsedHarvestDate,
        expiryDate: parsedExpiryDate,
        farmingMethods: notes?.trim() || location?.trim() || null,
        status: normalizeBatchStatus(status),
      },
      include: buildBatchInclude(),
    });

    res.json(jsonSafe(updatedBatch));
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
      include: buildTransportInclude(),
    });

    res.json(jsonSafe(transports));
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/batches/:batchCode/assign-transport", async (req, res, next) => {
  try {
    const { driverAccountId, driverName, receiverPartnerId } = req.body as {
      driverAccountId?: number | string;
      driverName?: string;
      receiverPartnerId?: number | string;
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
          },
        })
      : null;
    const name = driver?.fullName ?? driverName?.trim();

    if (!name) {
      res.status(400).json({ message: "A valid transporter account is required" });
      return;
    }

    const batch = await prisma.batch.findUnique({
      where: { batchCode: req.params.batchCode },
      include: {
        farmPartner: true,
        transport: true,
      },
    });

    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    if (batch.status !== PrismaBatchStatus.AT_WAREHOUSE && batch.status !== PrismaBatchStatus.IN_TRANSIT) {
      res.status(409).json({ message: "Batch must be ready before assigning transport" });
      return;
    }

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

    const assignedTransport = await prisma.$transaction(async (tx) => {
      await tx.batch.update({
        where: { batchId: batch.batchId },
        data: { status: PrismaBatchStatus.IN_TRANSIT },
      });

      const transport = batch.transport
        ? await tx.transport.update({
            where: { transportId: batch.transport.transportId },
            data: {
              shipperPartnerId: batch.farmPartnerId,
              receiverPartnerId: receiverPartner?.partnerId ?? batch.transport.receiverPartnerId,
              driverName: name,
              transportStatus: TransportStatus.IN_TRANSIT,
              actualDeparture: batch.transport.actualDeparture ?? new Date(),
            },
            include: buildTransportInclude(),
          })
        : await tx.transport.create({
            data: {
              batchId: batch.batchId,
              shipperPartnerId: batch.farmPartnerId,
              receiverPartnerId: receiverPartner?.partnerId ?? null,
              driverName: name,
              transportStatus: TransportStatus.IN_TRANSIT,
              actualDeparture: new Date(),
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

apiRouter.get("/transports/:transportId/checkpoints", async (req, res, next) => {
  try {
    const transportId = Number(req.params.transportId);

    if (!Number.isInteger(transportId)) {
      res.status(400).json({ message: "transportId must be an integer" });
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

apiRouter.post("/transports/:transportId/checkpoints", async (req, res, next) => {
  try {
    const transportId = Number(req.params.transportId);

    if (!Number.isInteger(transportId)) {
      res.status(400).json({ message: "transportId must be an integer" });
      return;
    }

    const transport = await prisma.transport.findUnique({
      where: { transportId },
      select: { transportId: true },
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

    const checkpoint = await prisma.transportCheckpoint.create({
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
      await markTransportArrivedWarehouse(transportId);
    }

    res.status(201).json(jsonSafe(checkpoint));
  } catch (error) {
    next(error);
  }
});

apiRouter.put("/transports/:transportId/checkpoints/:checkpointId", async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const transportId = Number(req.params.transportId);
    const checkpointId = Number(req.params.checkpointId);

    if (!Number.isInteger(transportId) || !Number.isInteger(checkpointId)) {
      res.status(400).json({ message: "transportId and checkpointId must be integers" });
      return;
    }

    const checkpoint = await prisma.transportCheckpoint.findFirst({
      where: { checkpointId, transportId },
      select: { checkpointId: true },
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

    const updatedCheckpoint = await prisma.transportCheckpoint.update({
      where: { checkpointId },
      data: checkpointData,
    });

    if (body.arrivedWarehouse === true) {
      await markTransportArrivedWarehouse(transportId);
    }

    res.json(jsonSafe(updatedCheckpoint));
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/store/deliveries", async (req, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const where = status === "pending"
      ? {
          transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
          incidents: { none: {} },
        }
      : status === "delivered"
        ? { transportStatus: TransportStatus.DELIVERED }
        : {};

    const deliveries = await prisma.transport.findMany({
      where,
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
        transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
        incidents: { none: {} },
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
      res.status(404).json({ message: "Delivery not found or not waiting for confirmation" });
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

apiRouter.post("/store/deliveries/:batchCode/issues", async (req, res, next) => {
  try {
    const accountId = Number(req.body?.accountId);
    const quantityAffected = Number(req.body?.quantityAffected);

    const delivery = await prisma.transport.findFirst({
      where: {
        transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
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
      res.status(404).json({ message: "Delivery not found or not waiting for confirmation" });
      return;
    }

    const issue = await prisma.incident.create({
      data: {
        transportId: delivery.transportId,
        batchId: delivery.batchId,
        reportedBy: Number.isInteger(accountId) ? accountId : null,
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

    res.status(201).json(jsonSafe(issue));
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/store/issues", async (_req, res, next) => {
  try {
    const issues = await prisma.incident.findMany({
      where: {
        transport: {
          transportStatus: TransportStatus.ARRIVED_WAREHOUSE,
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
