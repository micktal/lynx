import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSupabaseProxy } from "./routes/supabase-proxy";
import { handleStorageUpload } from "./routes/storage-proxy";
import attachmentsRoute from "./routes/attachments";
import rulesRoute from "./routes/rules";
import actionsRoute from "./routes/actions";
import risksRoute from "./routes/risks";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());

  // storage upload route (raw body) — mount only if handler is available
  if (typeof handleStorageUpload === "function") {
    app.put(
      "/api/storage/upload",
      express.raw({ type: "*/*", limit: "25mb" }),
      handleStorageUpload,
    );
  } else {
    console.warn("handleStorageUpload is not available; storage upload route not mounted");
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // attachments router
  app.use("/api/attachments", attachmentsRoute);

  // rules router
  app.use("/api/rules", rulesRoute);

  // actions router (enforcement)
  app.use("/api/actions", actionsRoute);

  // risks router (enforcement)
  app.use("/api/risks", risksRoute);

  // Supabase proxy route
  app.all("/api/supabase", handleSupabaseProxy);

  // Health check
  app.get("/api/health", async (_req, res) => {
    const result: any = { ok: true };

    // Supabase check
    try {
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        result.supabase = { ok: false, error: "env missing" };
      } else {
        const url = `${SUPABASE_URL}/rest/v1/attachments?select=id&limit=1`;
        const r = await fetch(url, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        });
        result.supabase = { ok: r.ok, status: r.status };
      }
    } catch (e: any) {
      result.supabase = { ok: false, error: String(e?.message || e) };
    }

    // Redis check (optional)
    try {
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL;
      if (!redisUrl) {
        result.redis = { ok: false, error: "no REDIS_URL" };
      } else {
        try {
          const redisModule = await import("redis");
          const client = redisModule.createClient({ url: redisUrl });
          client.on("error", () => {});
          await client.connect();
          const pong = await client.ping();
          await client.disconnect();
          result.redis = { ok: pong === "PONG" || pong === "OK", pong };
        } catch (re) {
          result.redis = { ok: false, error: String(re) };
        }
      }
    } catch (e: any) {
      result.redis = { ok: false, error: String(e?.message || e) };
    }

    res.json(result);
  });

  return app;
}
