// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const auth = async (req, res, next) => {
//   try {
//     // Extract token from Authorization header
//     const authHeader = req.header("Authorization");
//     console.log("Received Authorization header:", authHeader); // Debug

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       throw new Error("No token provided or invalid format");
//     }

//     const token = authHeader.replace("Bearer ", "");
//     console.log("Extracted token:", token); // Debug

//     // Check if JWT_SECRET is set
//     if (!process.env.JWT_SECRET) {
//       throw new Error("JWT_SECRET is not defined in environment variables");
//     }

//     // Verify token
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//       // console.log(token)
//     } catch (jwtError) {
//       if (jwtError.name === "JsonWebTokenError") {
//         throw new Error("Invalid token format or signature");
//       } else if (jwtError.name === "TokenExpiredError") {
//         throw new Error("Token has expired");
//       } else {
//         throw new Error(`JWT verification failed: ${jwtError.message}`);
//       }
//     }

//     console.log("Decoded token payload:", decoded); // Debug

//     // Check for required payload field
//     if (!decoded.id) {
//       throw new Error("Invalid token payload: missing 'id' field");
//     }

//     // Find user
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//       throw new Error("User not found for token ID: " + decoded.id);
//     }

//     // Attach user and token to request
//     req.user = user;
//     req.token = token;

//     console.log(`Authenticated user: ${user.email}`); // Debug
//     next();
//   } catch (error) {
//     console.error("Authentication error:", error.message); // Log details
//     res.status(401).json({
//       status: "error",
//       message: "Please authenticate",
//       error: error.message, // Specific error message
//     });
//   }
// };

// module.exports = auth;


const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header("Authorization");
    console.log("Received Authorization header:", authHeader); // Debug

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided or invalid format");
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Extracted token:", token); // Debug

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "JsonWebTokenError") {
        throw new Error("Invalid token format or signature");
      } else if (jwtError.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      } else {
        throw new Error(`JWT verification failed: ${jwtError.message}`);
      }
    }

    console.log("Decoded token payload:", decoded); // Debug

    // Check for required payload field
    if (!decoded.id) {
      throw new Error("Invalid token payload: missing 'id' field");
    }

    // Find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new Error("User not found for token ID: " + decoded.id);
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
      message: "Please authenticate",
      error: error.message, // Specific error message
    });
  }
};

module.exports = auth;