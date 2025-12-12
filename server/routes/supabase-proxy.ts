import { RequestHandler } from "express";
import https from "https";
import http from "http";

const SUPABASE_URL = "https://juyownedgwfbigbwofxx.supabase.com";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1eW93bmVkZ3dmYmlnYndvZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzM4MTgsImV4cCI6MjA4MTEwOTgxOH0.4LOp1KHJH2pY6SHXjvRVLcicbENe5-EUH16yIxGD-HI";

export const handleSupabaseProxy: RequestHandler = (req, res) => {
  const { path } = req.query;

  if (!path || typeof path !== "string") {
    return res.status(400).json({ error: "Missing or invalid path parameter" });
  }

  const method = (req.method || "GET").toUpperCase();
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Prefer: "return=representation",
  };

  let body: string | undefined;
  if (
    req.body &&
    method !== "GET" &&
    method !== "HEAD"
  ) {
    try {
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    } catch (err) {
      return res
        .status(400)
        .json({ error: "Failed to serialize request body" });
    }
  }

  const isHttps = url.protocol === "https:";
  const client = isHttps ? https : http;

  const options = {
    method,
    headers: {
      ...headers,
      ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
    },
  };

  try {
    const proxyReq = client.request(url, options, (proxyRes) => {
      let responseData = "";

      proxyRes.on("data", (chunk) => {
        responseData += chunk;
      });

      proxyRes.on("end", () => {
        const contentType = proxyRes.headers["content-type"] || "";
        const statusCode = proxyRes.statusCode || 500;

        // Forward the status code
        res.status(statusCode);

        // Forward relevant headers
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        }

        if (
          statusCode === 204 ||
          contentType.indexOf("application/json") === -1
        ) {
          return res.end();
        }

        try {
          const data = JSON.parse(responseData);
          return res.json(data);
        } catch (e) {
          return res.end(responseData);
        }
      });
    });

    proxyReq.on("error", (error) => {
      console.error("Proxy request error:", error);
      res.status(500).json({
        error: "Failed to proxy request to Supabase",
        details: error instanceof Error ? error.message : String(error),
      });
    });

    if (body) {
      proxyReq.write(body);
    }

    proxyReq.end();
  } catch (error) {
    console.error("Supabase proxy error:", error);
    res.status(500).json({
      error: "Failed to proxy request to Supabase",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
