const Redis = require("ioredis");
const logger = require("./logger");

let redisClient;

const connectRedis = async () => {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) return null;
      return Math.min(times * 200, 3000);
    },
  });

  return new Promise((resolve, reject) => {
    redisClient.on("ready", () => {
      logger.info("✅ Redis ready");
      resolve();
    });

    redisClient.on("error", (err) => {
      logger.error(`❌ Redis error: ${err.message}`);
    });

    // Timeout if Redis never becomes ready
    setTimeout(() => reject(new Error("Redis connection timeout")), 10000);
  });
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
