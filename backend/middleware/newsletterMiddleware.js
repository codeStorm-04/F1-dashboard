const User = require("../models/User");

const checkNewsletterPreference = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.newsletter) {
      return res
        .status(400)
        .json({ message: "Redirecting to newsletter preferences..." });
    }

    next(); // Proceed if newsletter is false
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = checkNewsletterPreference;
