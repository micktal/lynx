import { RequestHandler } from "express";

// Prefer using global fetch for simplicity and better TLS handling.
// Node 18+ provides global fetch. If not available, the runtime will error and the proxy will fall back to the previous implementation.

const SUPABASE_URL = process.env.SUPABASE_URL || "https://juyownedgwfbigbwofxx.supabase.com";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1eW93bmVkZ3dmYmlnYndvZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzM4MTgsImV4cCI6MjA4MTEwOTgxOH0.4LOp1KHJH2pY6SHXjvRVLcicbENe5-EUH16yIxGD-HI";

export const handleSupabaseProxy: RequestHandler = async (req, res) => {
  const { path } = req.query;

  if (!path || typeof path !== "string") {
    return res.status(400).json({ error: "Missing or invalid path parameter" });
  }

  const method = (req.method || "GET").toUpperCase();

  // Support either a simple path (e.g. "sites?select=*") or a full URL
  let targetUrl: string;
  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      targetUrl = path;
    } else {
      // Use the Supabase REST endpoint
      targetUrl = `${SUPABASE_URL}/rest/v1/${path}`;
    }
  } catch (err) {
    return res.status(400).json({ error: "Invalid path parameter" });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Prefer: "return=representation",
  };

  // Build fetch options
  const fetchOptions: any = {
    method,
    headers: {
      ...headers,
      // forward some incoming headers (like range, accept) if present
      ...(req.headers && req.headers.accept ? { Accept: String(req.headers.accept) } : {}),
    },
  };

  if (req.body && method !== "GET" && method !== "HEAD") {
    try {
      fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    } catch (err) {
      return res.status(400).json({ error: "Failed to serialize request body" });
    }
  }

  try {
    // Use global fetch for the outgoing request
    const upstream = await fetch(targetUrl, fetchOptions as RequestInit);

    // Forward status and headers
    res.status(upstream.status);
    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);

    // If no body or not JSON, stream raw
    if (upstream.status === 204 || !contentType || contentType.indexOf("application/json") === -1) {
      const buffer = await upstream.arrayBuffer();
      return res.end(Buffer.from(buffer));
    }

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Supabase upstream error", upstream.status, data);
      return res.json({ error: "Supabase error", status: upstream.status, details: data });
    }

    return res.json(data);
  } catch (error: any) {
    console.error("Supabase proxy fetch error:", error && error.stack ? error.stack : error);
    return res.status(500).json({ error: "Failed to proxy request to Supabase", details: error?.message || String(error) });
  }
};
