const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const transportNumericId = Number("39");
  console.log("transportNumericId", transportNumericId);
  
  const transport = await prisma.transport.findFirst({
    where: { transportId: transportNumericId },
    include: {
      checkpoints: { select: { checkpointId: true } },
      incidents: { select: { incidentId: true } },
    },
  });

  if (!transport) {
    console.log("Transport not found");
    return;
  }
  console.log("Transport found:", transport.transportId);
}
main().catch(console.error).finally(() => prisma.$disconnect());
