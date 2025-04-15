// const express = require("express");
// const router = express.Router();
// const f1Controller = require("../controllers/f1Controller");
// const auth = require("../middleware/auth");

// // All routes require authentication
// router.use(auth);

// // Insert initial F1 data
// router.post("/initial-data", f1Controller.insertInitialData);

// // Constructors Championship routes
// router.get("/constructors/:year", f1Controller.getConstructorsChampionship);

// // Drivers Championship routes
// router.get("/drivers/:year", f1Controller.getDriversChampionship);

// router.get("/driver", f1Controller.getAllDrivers);

// // Practice Session routes
// router.get("/practice/:year/:round/:session", f1Controller.getPracticeSession);

// module.exports = router;

// routes/f1Routes.js
const express = require("express");
const router = express.Router();
const f1Controller = require("../controllers/f1Controller");
const auth = require("../middleware/auth");
const redisCache = require("../middleware/redisCache");

// All routes require authentication
router.use(auth);

// Insert initial F1 data (typically a POST, so caching is not applied)
router.post("/initial-data", f1Controller.insertInitialData);

// Constructors Championship routes (apply caching)
router.get(
  "/constructors/:year",
  redisCache({ ttl: 3600 }),
  f1Controller.getConstructorsChampionship
);

// Drivers Championship routes (apply caching)
router.get(
  "/drivers/:year",
  redisCache({ ttl: 3600 }),
  f1Controller.getDriversChampionship
);

// Get all drivers (apply caching)
router.get("/driver", redisCache({ ttl: 3600 }), f1Controller.getAllDrivers);

// Practice Session routes (apply caching)
router.get(
  "/practice/:year/:round/:session",
  redisCache({ ttl: 3600 }),
  f1Controller.getPracticeSession
);

module.exports = router;
