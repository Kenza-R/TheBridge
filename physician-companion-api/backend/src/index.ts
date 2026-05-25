import "dotenv/config";
import { getEnv } from "./config/env.js";
import { buildApp } from "./app.js";
import { disconnectPrisma } from "./lib/prisma.js";
import { disconnectRedis } from "./lib/redis.js";

async function main() {
  const env = getEnv();
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`API listening on :${env.PORT}${env.API_PREFIX}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const shutdown = async () => {
    await app.close();
    await disconnectPrisma();
    await disconnectRedis();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
