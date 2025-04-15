// backend/routes/redisRoutes.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const { redisClient } = require("../config/RedisClient"); // destructured correctly

const RACE_CACHE_KEY = "next_race";
const CACHE_EXPIRATION = 86400; // 1 day in seconds

router.get("/next-race", async (req, res) => {
  try {
    const cachedData = await redisClient.get(RACE_CACHE_KEY);
    if (cachedData) {
      console.log("Serving next race from Redis Cache");
      return res.json(JSON.parse(cachedData));
    }

    const response = await axios.get(
      "https://f1connectapi.vercel.app/api/current/next"
    );
    const raceData = response.data;

    await redisClient.set(
      RACE_CACHE_KEY,
      JSON.stringify(raceData),
      "EX",
      CACHE_EXPIRATION
    );
    console.log("Storing next race data in Redis");

    res.json(raceData);
  } catch (err) {
    console.error("❌ Failed to fetch next race:", err);
    res.status(500).json({ error: "Failed to fetch next race data" });
  }
});

module.exports = router;
