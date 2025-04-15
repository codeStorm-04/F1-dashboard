const User = require("../models/User");
const Newsletter = require("../models/Newsletter");
const { sendMail } = require("../helpers/sendMail");

const authController = {
  // Register a new user
  async register(req, res) {
    try {
      const { email, password, name, newsletter } = req.body;
      console.log("Registration attempt for:", { email, name, newsletter });

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({
          status: "error",
          message: "Email, password, and name are required",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          status: "error",
          message: "Email already registered",
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        name,
        newsletter: newsletter || false,
      });

      await user.save();
      console.log(`User registered: ${email}`);

      // Generate token
      const token = user.generateAuthToken();

      res.status(201).json({
        status: "success",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role || "user",
            newsletter: user.newsletter,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error during registration:", error.message);
      res.status(500).json({
        status: "error",
        message: "Failed to create user",
        error: error.message,
      });
    }
  },

  async saveNewsletterPreferences(req, res) {
    try {
      const {
        emailFrequency,
        favoriteDriver,
        favoriteConstructor,
        eventName,
        preferences,
      } = req.body;
      const userId = req.user._id;

      console.log("Saving newsletter preferences for user:", userId);
      console.log("Preferences data:", {
        emailFrequency,
        favoriteDriver,
        favoriteConstructor,
        eventName,
        preferences,
      });

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Create or update newsletter preferences
      const newsletter = await Newsletter.findOneAndUpdate(
        { user: userId },
        {
          emailFrequency,
          favoriteDriver,
          favoriteConstructor,
          eventName,
          preferences: {
            f1News: preferences.f1News || false,
            raceUpdates: preferences.raceUpdates || false,
            driverUpdates: preferences.driverUpdates || false,
            teamUpdates: preferences.teamUpdates || false,
          },
        },
        { upsert: true, new: true }
      );

      // Update user's newsletter status
      user.newsletter = true;
      await user.save();

      console.log("Newsletter preferences saved successfully:", newsletter);
      res.status(200).json({
        status: "success",
        message: "Newsletter preferences saved successfully",
        data: newsletter,
      });
    } catch (error) {
      console.error("Error saving newsletter preferences:", error.message);
      res.status(500).json({
        status: "error",
        message: "Failed to save newsletter preferences",
        error: error.message,
      });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);

      // Validate input
      if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({
          status: "error",
          message: "Email and password are required",
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log("Invalid password for email:", email);
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Generate token
      const token = user.generateAuthToken();
      console.log("Token generated successfully for user:", email);
      // console.log("Token length:", token.length);

      const response = {
        status: "success",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role || "user",
          },
          token,
        },
      };
      // console.log("Sending response:", JSON.stringify(response, null, 2));
      // sendMail(
      //   email,
      //   "welcome to F1 Dashboard",
      //   `Hi, tanu Thank you for coming back`
      // );
      res.json(response);
    } catch (error) {
      console.error("Error during login:", error.message);
      res.status(500).json({
        status: "error",
        message: "Failed to log in",
        error: error.message,
      });
    }
  },

  // Get current user profile
  async getProfile(req, res) {
    try {
      // Assumes req.user is set by auth middleware
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "Please authenticate",
        });
      }

      const user = await User.findById(req.user._id).select("-password");
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      console.log(`Profile fetched for user: ${user.email}`);
      res.json({
        status: "success",
        data: { user },
      });
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch profile",
        error: error.message,
      });
    }
  },

  // Optional: Logout (invalidate token client-side or server-side if using blacklist)
  async logout(req, res) {
    try {
      // If using token blacklist, implement here (requires additional storage)
      // For JWT, logout is typically client-side (delete token)
      console.log(`User logged out: ${req.user?.email || "unknown"}`);
      res.json({
        status: "success",
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Error during logout:", error.message);
      res.status(500).json({
        status: "error",
        message: "Failed to log out",
        error: error.message,
      });
    }
  },

  // Update newsletter preferences
  async updateNewsletterPreferences(req, res) {
    try {
      const { f1News, raceUpdates, driverUpdates, teamUpdates } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      user.newsletterPreferences = {
        f1News,
        raceUpdates,
        driverUpdates,
        teamUpdates,
      };

      await user.save();
      console.log(`Newsletter preferences updated for user: ${user.email}`);

      res.json({
        status: "success",
        message: "Newsletter preferences updated successfully",
        data: {
          newsletterPreferences: user.newsletterPreferences,
        },
      });
    } catch (error) {
      console.error("Error updating newsletter preferences:", error.message);
      res.status(500).json({
        status: "error",
        message: "Failed to update newsletter preferences",
        error: error.message,
      });
    }
  },

  // Unsubscribe from newsletter
  async unsubscribe(req, res) {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Set newsletter to false and reset preferences
      user.newsletter = false;
      user.newsletterPreferences = {
        f1News: false,
        raceUpdates: false,
        driverUpdates: false,
        teamUpdates: false,
      };

      await user.save();
      console.log(`User ${user.email} unsubscribed from newsletter`);

      res.json({
        status: "success",
        message: "Successfully unsubscribed from newsletter",
        data: {
          newsletter: user.newsletter,
          newsletterPreferences: user.newsletterPreferences,
        },
      });
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error.message);
      res.status(500).json({
        status: "error",
        message: "Failed to unsubscribe from newsletter",
        error: error.message,
      });
    }
  },
};

module.exports = authController;
