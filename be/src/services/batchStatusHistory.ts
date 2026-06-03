import type { BatchStatus } from "../generated/prisma/enums.ts";

type HistoryDb = {
  batchStatusHistory: {
    create(args: {
      data: {
        batchId: number;
        status: BatchStatus;
        locationName?: string | null;
        note?: string | null;
        changedBy?: number | null;
      };
    }): Promise<unknown>;
  };
};

export async function appendBatchStatusHistory(
  db: HistoryDb,
  payload: {
    batchId: number;
    status: BatchStatus;
    locationName?: string | null;
    note?: string | null;
    changedBy?: number | null;
  },
) {
  await db.batchStatusHistory.create({
    data: {
      batchId: payload.batchId,
      status: payload.status,
      locationName: payload.locationName ?? null,
      note: payload.note ?? null,
      changedBy: payload.changedBy ?? null,
    },
  });
}
