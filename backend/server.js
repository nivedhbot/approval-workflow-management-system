const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

const isTest = process.env.NODE_ENV === "test";
const isProd = process.env.NODE_ENV === "production";

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (!isTest && missingEnv.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnv.join(", ")}`,
  );
}

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(helmet());
const rawOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProd && allowedOrigins.length === 0) {
  throw new Error("FRONTEND_URL or FRONTEND_URLS must be set in production");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());
app.use(mongoSanitize());

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", isTest ? authRoutes : [authRateLimiter, authRoutes]);
app.use("/api/requests", require("./routes/requests"));
app.use("/api/requirements", require("./routes/requirements"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Approval Workflow API is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
