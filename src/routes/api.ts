import { Router } from "express";
import { prisma } from "../lib/prisma.ts";
import { jsonSafe } from "../utils/json.ts";

export const apiRouter = Router();

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
      include: {
        farmPartner: true,
        qrCode: true,
      },
    });

    res.json(jsonSafe(batches));
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
