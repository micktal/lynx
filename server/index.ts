import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSupabaseProxy } from "./routes/supabase-proxy";
import { handleStorageUpload } from "./routes/storage-proxy";
import attachmentsRoute from "./routes/attachments";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());

  // storage upload route (raw body)
  app.put('/api/storage/upload', express.raw({ type: '*/*', limit: '25mb' }), handleStorageUpload);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // attachments router
  app.use('/api/attachments', attachmentsRoute);

  // Supabase proxy route
  app.all("/api/supabase", handleSupabaseProxy);

  return app;
}
