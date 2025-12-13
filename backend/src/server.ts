import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

// Connect to database (non-blocking)
connectDB().catch((error) => {
  console.error("Database connection error:", error);
});

// Start server
const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
  console.log(`📍 Health check: http://localhost:${env.PORT}/api/health`);
});

// Handle server errors
server.on("error", (error: any) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} is already in use. Please use a different port.`);
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});
