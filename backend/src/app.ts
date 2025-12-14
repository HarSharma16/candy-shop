import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import sweetRoutes from "./routes/sweet.routes";

const app = express();

// CORS configuration
app.use(cors({ 
  origin: "http://localhost:3000",
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically. Use UPLOAD_DIR if set, otherwise default to
// project uploads directory so local dev works. If UPLOAD_DIR points to a tmp
// dir used in serverless, serving may not be necessary; adjust as needed.
const uploadsPath = process.env.UPLOAD_DIR || path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

export default app;
