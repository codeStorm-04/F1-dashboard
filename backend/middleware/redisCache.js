// backend/middleware/redisCache.js
const { redisClient } = require("../config/RedisClient"); // Destructure to get redisClient

// Generate a cache key based on the HTTP method and full URL (includes query params)
function generateCacheKey(req) {
  return `${req.method}:${req.originalUrl}`;
}

const redisCache = (options = {}) => {
  // Set a default TTL (time-to-live) in seconds (e.g., 3600 = 1 hour)
  const ttl = options.ttl || 3600;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    const key = generateCacheKey(req);
    try {
      // Check if cached data exists
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        console.log(`Cache hit for key: ${key}`);
        // Return the cached response (assuming JSON data)
        return res.json(JSON.parse(cachedData));
      }
      console.log(`Cache miss for key: ${key}`);

      // Override res.send to cache the response data when the controller sends it
      const originalSend = res.send.bind(res);
      res.send = (body) => {
        // Only cache successful responses (status code 2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache the response with the defined TTL
          redisClient.set(key, body, "EX", ttl).catch((err) => {
            console.error(`Error caching key ${key}:`, err);
          });
        }
        return originalSend(body);
      };

      next();
    } catch (error) {
      console.error("Redis cache middleware error:", error);
      next();
    }
  };
};

module.exports = redisCache;
