const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables first
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // Start server only after MongoDB connects
    startServer();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// Routes and server startup
function startServer() {
  // Verify route modules are loaded
  let f1Routes, authRoutes, errorHandler;
  try {
    f1Routes = require("./routes/f1Routes");
    authRoutes = require("./routes/authRoutes");
    errorHandler = require("./middleware/errorHandler");
  } catch (err) {
    console.error("Error loading route modules:", err);
    process.exit(1); // Exit if modules fail to load
  }

  app.use("/api/auth", authRoutes);
  app.use("/api/f1", f1Routes);

  // Error handling
  app.use(errorHandler);

  // Catch-all for undefined routes (debugging 404s)
  app.use((req, res) => {
    console.log(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ status: "error", message: "Route not found" });
  });

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}
