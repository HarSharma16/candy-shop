import serverless from "serverless-http";
import app from "./app";
import { connectDB } from "./config/db";

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Keep Lambda execution environment alive for DB connection reuse
  if (context && typeof context === "object") {
    // Prevent Lambda from waiting for open event loop items
    context.callbackWaitsForEmptyEventLoop = false;
  }

  if (!(global as any).__mongoConnected) {
    try {
      await connectDB();
      (global as any).__mongoConnected = true;
    } catch (err) {
      console.error("Handler: failed to connect DB:", err);
    }
  }

  return serverlessHandler(event, context);
};

export default handler;
