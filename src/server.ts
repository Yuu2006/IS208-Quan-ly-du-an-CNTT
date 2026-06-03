import "dotenv/config";
import { app } from "./app.ts";
import { disconnectPrisma } from "./lib/prisma.ts";

const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  console.log(`Backend API is running at http://localhost:${port}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
