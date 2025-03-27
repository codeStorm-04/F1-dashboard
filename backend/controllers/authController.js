const User = require("../models/User");

const authController = {
  // Register a new user
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

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
        password, // Assumes password hashing in User model
        name,
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
            role: user.role || "user", // Ensure role is always present
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error during registration:", error.message);
      res.status(500).json({
        status: "error",
        message: "Failed to create user",
        error: error.message, // Detailed error for debugging
      });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Email and password are required",
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }
      // Generate token
      const token = user.generateAuthToken();
      console.log(`User logged in: ${email}`);

      res.json({
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
      });
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
};

module.exports = authController;
