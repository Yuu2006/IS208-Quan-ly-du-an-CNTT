import { randomUUID } from "node:crypto";
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = "postgresql://postgres.icuvzbrpjddtgajvbngf:Nguyentuanvu2006@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
process.env.DIRECT_URL = "postgresql://postgres.icuvzbrpjddtgajvbngf:Nguyentuanvu2006@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient();

async function main() {
  const transportNumericId = Number("39");
  console.log("transportNumericId", transportNumericId);
  
  const transport = await prisma.transport.findFirst({
    where: { transportId: transportNumericId },
  });

  if (!transport) {
    console.log("Transport not found in DB!");
  } else {
    console.log("Transport found:", transport.transportId);
  }

  const logs = await prisma.auditLog.findMany({
    where: { objectId: "39" }
  });
  console.log("Audit Logs with objectId 39:", logs.map(l => l.objectType));
}
main().catch(console.error).finally(() => prisma.$disconnect());
