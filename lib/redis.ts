import "dotenv/config";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
});

redis.on("error", (error) => {
  console.warn(`[redis] ${error.message}`);
});

export async function connectRedis() {
  try {
    await redis.connect();
    console.log(`[redis] connected to ${redisUrl}`);
  } catch (error) {
    console.warn(`[redis] unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getCachedJson<T>(key: string, fallback: () => Promise<T>, ttl = 300) {
  if (!redis.status || redis.status === "end") {
    return fallback();
  }

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.warn(`[redis] cache read failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const value = await fallback();
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (error) {
    console.warn(`[redis] cache write failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  return value;
}

export async function setCachedJson(key: string, value: unknown, ttl = 300) {
  if (!redis.status || redis.status === "end") {
    return;
  }

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (error) {
    console.warn(`[redis] cache write failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteCachedKey(key: string) {
  if (!redis.status || redis.status === "end") {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`[redis] cache delete failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
