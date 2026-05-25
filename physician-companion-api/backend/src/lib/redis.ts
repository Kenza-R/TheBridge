import { Redis } from "ioredis";
import { getEnv } from "../config/env.js";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  }
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
