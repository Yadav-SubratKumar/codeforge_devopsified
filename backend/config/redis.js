const Redis = require("ioredis");
const logger = require("./logger");

let redisClient;

const connectRedis = async () => {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  redisClient.on("connect", () => logger.info("✅ Redis connected"));
  redisClient.on("error", (err) => logger.error("❌ Redis error:", err.message));
};

const getRedis = () => {
  if (!redisClient) throw new Error("Redis not initialized");
  return redisClient;
};

// Cache helpers
const cacheGet = async (key) => {
  const data = await getRedis().get(key);
  return data ? JSON.parse(data) : null;
};

const cacheSet = async (key, value, ttlSeconds = 300) => {
  await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
};

const cacheDel = async (key) => {
  await getRedis().del(key);
};

module.exports = { connectRedis, getRedis, cacheGet, cacheSet, cacheDel };
