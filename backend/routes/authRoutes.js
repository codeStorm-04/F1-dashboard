const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", auth, authController.getProfile);
router.post("/logout", auth, authController.logout);
router.post(
  "/save-newsletter-preferences",
  auth,
  authController.saveNewsletterPreferences
);
router.post("/unsubscribe", auth, authController.unsubscribe);

module.exports = router;
