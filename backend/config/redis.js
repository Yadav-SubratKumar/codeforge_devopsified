const Redis = require("ioredis");
const logger = require("./logger");

let redisClient;

const connectRedis = async () => {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error("Redis retry limit reached — giving up");
        return null; // stop retrying
      }
      return Math.min(times * 200, 3000);
    },
    lazyConnect: false,
  });

  redisClient.on("connect", () => logger.info("✅ Redis connected"));
  redisClient.on("ready",   () => logger.info("✅ Redis ready"));
  redisClient.on("error",   (err) => logger.error(`❌ Redis error: ${err.message}`));
  redisClient.on("close",   () => logger.warn("⚠️  Redis connection closed"));

  // Verify the connection actually works (catches auth failures immediately)
  try {
    await redisClient.ping();
    logger.info("✅ Redis ping OK");
  } catch (err) {
    logger.error(`❌ Redis connect failed: ${err.message}`);
    process.exit(1);
  }
};

const getRedis = () => {
  if (!redisClient) throw new Error("Redis not initialized");
  return redisClient;
};

const cacheGet = async (key) => {
  try {
    const data = await getRedis().get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error(`Cache GET error [${key}]: ${err.message}`);
    return null;
  }
};

const cacheSet = async (key, value, ttlSeconds = 300) => {
  try {
    await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.error(`Cache SET error [${key}]: ${err.message}`);
  }
};

const cacheDel = async (key) => {
  try {
    await getRedis().del(key);
  } catch (err) {
    logger.error(`Cache DEL error [${key}]: ${err.message}`);
  }
};

module.exports = { connectRedis, getRedis, cacheGet, cacheSet, cacheDel };
