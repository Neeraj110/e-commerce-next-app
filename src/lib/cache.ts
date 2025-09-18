import redis from "./redis";

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 3600
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.error("Failed to set cache for key:", key, error);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (error) {
    console.error("Failed to get cache for key:", key, error);
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Failed to delete cache for key:", key, error);
  }
}

export function generateCacheKey(req: Request): string {
  try {
    const url = new URL(req.url);

    const baseUrl = `cache${url.pathname.replace(/\/+/g, "_")}`;

    const queryParams = Array.from(url.searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    // console.log("Generated Cache Key:", queryParams ? `${baseUrl}?${queryParams}` : baseUrl);

    return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
  } catch (error) {
    console.error("Failed to generate cache key:", error);
    return "cache_unknown";
  }
}

export async function invalidateCache(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Invalidated ${keys.length} keys with pattern: ${pattern}`);
    }
  } catch (error) {
    console.error("Cache invalidation failed:", error);
  }
}
