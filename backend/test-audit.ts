import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const logs = await prisma.auditLog.findMany({
    where: { action: 'TRANSPORT_ASSIGNED' },
    take: 2,
    select: { newValue: true }
  });
  console.log(JSON.stringify(logs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
