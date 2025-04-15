// backend/config/RedisClient.js
const Redis = require("ioredis");

// Create the Redis client
const redisClient = new Redis({
  host: "localhost", // or your Redis server IP
  port: 6379, // default Redis port
  // password: 'yourpassword', // if you have auth
});

const redisPub = new Redis({
  host: "localhost",
  port: 6379,
});

const redisSub = new Redis({
  host: "localhost",
  port: 6379,
});

// Handle connection events
redisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

module.exports = { redisClient, redisPub, redisSub };
