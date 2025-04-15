const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const authRoutes = require("./routes/authRoutes");
const f1Routes = require("./routes/f1Routes");
const { redisPub, redisSub } = require("./config/RedisClient");
const errorHandler = require("./middleware/errorHandler");
const socketIo = require("socket.io");
const redisCacheUtil = require("./utils/redisUtils");
const redisRoutes = require("./routes/redisRoutes");
const scheduleNewsletter = require("./utils/newsletterScheduler");

// Load environment variables
dotenv.config();

// Initialize newsletter scheduler
scheduleNewsletter();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Origin",
  ],
  exposedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/f1", f1Routes);
app.use("/api/f1", redisRoutes);

// Error handling middleware
app.use(errorHandler);

// Utility function: generate a cache key based on the filter parameter
function generateCacheKey(filterParam) {
  return `f1:${filterParam}:limit10`;
}

// Track active filters and their client counts
const activeFilters = new Map(); // e.g., Map<filter, { count: number, intervalId: NodeJS.Timeout }>

// Function to fetch data for a specific filter
const pollF1Data = async (filterParam, room) => {
  try {
    const cacheKey = generateCacheKey(filterParam);
    const cachedData = await redisCacheUtil.get(cacheKey);

    if (!cachedData) {
      console.log(`[Poll] Cache miss for ${filterParam}, fetching...`);
      const limit = 10;
      const apiUrl = `https://f1connectapi.vercel.app/api/current/last/${filterParam}?limit=${limit}`;
      const response = await axios.get(apiUrl);
      const dataToCache = JSON.stringify(response.data);

      await redisCacheUtil.set(cacheKey, dataToCache, "EX", 10); // Cache for 10 seconds
      io.to(room).emit("f1data", response.data); // Emit to specific room
      redisPub.publish(`f1_channel:${filterParam}`, dataToCache); // Publish to filter-specific channel
    } else {
      console.log(`[Poll] Cache hit for ${filterParam}`);
      io.to(room).emit("f1data", JSON.parse(cachedData)); // Emit to specific room
      redisPub.publish(`f1_channel:${filterParam}`, cachedData);
    }
  } catch (err) {
    console.error(`[Poll] Error fetching ${filterParam}:`, err.message);
    if (err.response?.status === 429) {
      console.warn(`Rate limit hit for ${filterParam}, backing off...`);
      // Optionally emit an error to the room
      io.to(room).emit("error", "Rate limit exceeded, please try again later");
    }
  }
};

// Redis Pub/Sub Setup
const filters = ["fp1", "fp2", "fp3", "qualy", "race"];
filters.forEach((filter) => {
  const channel = `f1_channel:${filter}`;
  redisSub.subscribe(channel, (err, count) => {
    if (err) console.error(`Redis subscribe error for ${channel}:`, err);
    else console.log(`Subscribed to ${channel} (${count} channel(s))`);
  });
});

// Handle Redis messages
redisSub.on("message", (channel, message) => {
  console.log(`Received message on channel ${channel}`);
  try {
    const filter = channel.split(":")[1]; // Extract filter from channel (e.g., f1_channel:fp1 -> fp1)
    const data = JSON.parse(message);
    io.to(filter).emit("f1data", data); // Emit to the filter-specific room
  } catch (err) {
    console.error("Error parsing Redis message:", err);
  }
});

// Socket.io Connection Handling
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    next();
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  let currentFilter = null;

  // Handle filter event from client
  socket.on("filter", async (payload) => {
    try {
      const filterParam = payload.filter;
      if (!filters.includes(filterParam)) {
        return socket.emit("error", "Invalid filter parameter");
      }

      // Leave previous room if any
      if (currentFilter) {
        socket.leave(currentFilter);
        const filterData = activeFilters.get(currentFilter);
        if (filterData) {
          filterData.count--;
          if (filterData.count <= 0) {
            clearInterval(filterData.intervalId);
            activeFilters.delete(currentFilter);
            console.log(`Stopped polling for ${currentFilter}`);
          }
        }
      }

      // Join new room
      socket.join(filterParam);
      currentFilter = filterParam;
      console.log(`Client ${socket.id} joined room ${filterParam}`);

      // Update active filters
      if (!activeFilters.has(filterParam)) {
        const intervalId = setInterval(
          () => pollF1Data(filterParam, filterParam),
          10 * 1000
        ); // Poll every 4 seconds
        activeFilters.set(filterParam, { count: 1, intervalId });
        console.log(`Started polling for ${filterParam}`);
      } else {
        const filterData = activeFilters.get(filterParam);
        filterData.count++;
      }

      // Fetch data immediately
      await pollF1Data(filterParam, filterParam);
    } catch (error) {
      console.error("Error handling filter event:", error);
      socket.emit("error", "Error processing your request");
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (currentFilter) {
      socket.leave(currentFilter);
      const filterData = activeFilters.get(currentFilter);
      if (filterData) {
        filterData.count--;
        if (filterData.count <= 0) {
          clearInterval(filterData.intervalId);
          activeFilters.delete(currentFilter);
          console.log(`Stopped polling for ${currentFilter}`);
        }
      }
    }
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
