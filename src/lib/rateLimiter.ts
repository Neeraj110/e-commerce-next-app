/**
 * src/lib/rateLimiter.ts
 * Sliding-window rate limiter backed by the existing ioredis client.
 *
 * Usage:
 *   const result = await rateLimit(ip, "chatbot", 10, 60); // 10 req / 60 s
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */
import redis from "./redis";

export interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (seconds) when the oldest token expires */
  resetAt: number;
}

/**
 * Sliding-window rate limiter using a Redis sorted set.
 *
 * @param identifier - Unique key (e.g. IP address or user ID)
 * @param namespace  - Feature namespace (e.g. "chatbot", "auth")
 * @param limit      - Maximum requests allowed within `windowSeconds`
 * @param windowSeconds - Length of the sliding window in seconds
 */
export async function rateLimit(
  identifier: string,
  namespace: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `rl:${namespace}:${identifier}`;
  const now = Date.now(); // milliseconds
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  const pipeline = redis.pipeline();

  // Remove tokens older than the sliding window
  pipeline.zremrangebyscore(key, "-inf", windowStart);
  // Add current request with its timestamp as both score and member
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  // Count total tokens in the window (includes the one just added)
  pipeline.zcard(key);
  // Fetch the oldest token so we know when the window resets
  pipeline.zrange(key, 0, 0, "WITHSCORES");
  // Reset TTL on the key
  pipeline.expire(key, windowSeconds + 1);

  const results = await pipeline.exec();

  // zcard result is at index 2
  const count = (results?.[2]?.[1] as number) ?? 0;
  // oldest score is at results[3][1][1] (zrange WITHSCORES returns [member, score, ...])
  const oldestScore =
    (results?.[3]?.[1] as string[] | null)?.[1] ?? String(now);
  const resetAt = Math.ceil((parseInt(oldestScore, 10) + windowMs) / 1000);

  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);

  return { allowed, remaining, resetAt };
}

