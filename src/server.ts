import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import adminExtraRoutes from "./routes/adminExtra.routes.js";
import orderRoutes from "./routes/order.routes.js";

import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// Reads a comma-separated list of allowed origins from ALLOWED_ORIGINS env var,
// falling back to FRONTEND_URL, then localhost for local development.
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "http://localhost:3000"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`CORS policy does not allow origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle CORS pre-flight and regular requests
app.use(cors(corsOptions));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Sanskriti Sarees API is running with Mongoose"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminExtraRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
});