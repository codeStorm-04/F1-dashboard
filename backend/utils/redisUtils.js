// backend/utils/redisUtils.js
const { redisClient } = require("../config/RedisClient");

module.exports = {
  async get(key) {
    return await redisClient.get(key);
  },
  async set(key, value, ...args) {
    return await redisClient.set(key, value, ...args);
  },
};
