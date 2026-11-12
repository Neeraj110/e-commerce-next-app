// import Redis from "ioredis";

// let redis: Redis | null = null;

// if (!redis) {
//   redis = new Redis(process.env.REDIS_URL!);
// }

// export default redis;

import Redis from "ioredis";

declare global {
  var _redis: Redis | undefined;
}

const redis =
  global._redis ??
  new Redis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

// Cache across ALL environments to prevent serverless connection exhaustion
global._redis = redis;

export default redis;
