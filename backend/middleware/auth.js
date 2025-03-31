const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header("Authorization");
    console.log("Received Authorization header:", authHeader); // Debug

    if (!authHeader) {
      throw new Error("No Authorization header provided");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new Error("Invalid token format. Must start with 'Bearer '");
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Extracted token:", token); // Debug

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      throw new Error("Server configuration error");
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified successfully");
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      if (jwtError.name === "JsonWebTokenError") {
        throw new Error("Invalid token signature");
      } else if (jwtError.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      } else {
        throw new Error(`JWT verification failed: ${jwtError.message}`);
      }
    }

    console.log("Decoded token payload:", decoded); // Debug

    // Check for required payload field
    if (!decoded.id) {
      console.error("Invalid token payload: missing 'id' field");
      throw new Error("Invalid token payload");
    }

    // Find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.error("User not found for token ID:", decoded.id);
      throw new Error("User not found");
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;

    console.log(`Authenticated user: ${user.email}`); // Debug
    next();
  } catch (error) {
    console.error("Authentication error:", error.message); // Log details
    res.status(401).json({
      status: "error",
      message: error.message || "Authentication failed",
      error: error.message,
    });
  }
};

module.exports = auth;
