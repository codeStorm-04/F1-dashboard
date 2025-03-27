const express = require("express");
const router = express.Router();
const f1Controller = require("../controllers/f1Controller");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Insert initial F1 data
router.post("/initial-data", f1Controller.insertInitialData);

// Constructors Championship routes

router.get("/constructors/:year", f1Controller.getConstructorsChampionship);
// Drivers Championship routes

router.get("/drivers/:year", f1Controller.getDriversChampionship);
// Practice Session routes
router.get("/practice/:year/:round/:session", f1Controller.getPracticeSession);
module.exports = router;
