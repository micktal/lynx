import { RequestHandler } from "express";

const SUPABASE_URL = "https://juyownedgwfbigbwofxx.supabase.com";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1eW93bmVkZ3dmYmlnYndvZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzM4MTgsImV4cCI6MjA4MTEwOTgxOH0.4LOp1KHJH2pY6SHXjvRVLcicbENe5-EUH16yIxGD-HI";

async function parseResponse(response: Response) {
  const contentType = response.headers.get("Content-Type") || "";
  if (
    response.status === 204 ||
    contentType.indexOf("application/json") === -1
  ) {
    return null;
  }
  return await response.json();
}

export const handleSupabaseProxy: RequestHandler = async (req, res) => {
  const { path } = req.query;

  if (!path || typeof path !== "string") {
    return res.status(400).json({ error: "Missing or invalid path parameter" });
  }

  const method = (req.method || "GET").toUpperCase();
  const url = `${SUPABASE_URL}/rest/v1/${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Prefer: "return=representation",
  };

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (
      req.body &&
      method !== "GET" &&
      method !== "HEAD"
    ) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const data = await response.json();
        errorMessage =
          (data && (data.message || data.error || data.description)) ||
          errorMessage;
      } catch (e) {}
      return res
        .status(response.status)
        .json({ error: `Supabase error: ${errorMessage}` });
    }

    const data = await parseResponse(response);
    return res.json(data);
  } catch (error) {
    console.error("Supabase proxy error:", error);
    return res
      .status(500)
      .json({
        error: "Failed to proxy request to Supabase",
        details: error instanceof Error ? error.message : String(error),
      });
  }
};
