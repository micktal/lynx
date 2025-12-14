import { RequestHandler } from "express";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://juyownedgwfbigbwofxx.supabase.com";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1eW93bmVkZ3dmYmlnYndvZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzM4MTgsImV4cCI6MjA4MTEwOTgxOH0.4LOp1KHJH2pY6SHXjvRVLcicbENe5-EUH16yIxGD-HI";

export const handleStorageUpload: RequestHandler = async (req, res) => {
  // expects PUT /api/storage/upload?bucket=NAME&path=path/to/file.ext
  const bucket = typeof req.query.bucket === 'string' ? req.query.bucket : undefined;
  const path = typeof req.query.path === 'string' ? req.query.path : undefined;

  if (!bucket || !path) {
    return res.status(400).json({ error: 'Missing bucket or path query parameter' });
  }

  try {
    const target = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}`;

    // Forward the request body to Supabase Storage
    const upstream = await fetch(target, {
      method: 'PUT',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        // preserve content-type if provided by client
        ...(req.headers['content-type'] ? { 'Content-Type': String(req.headers['content-type']) } : {}),
      },
      body: req.body,
    });

    const ok = upstream.ok;
    const text = await upstream.text();
    if (!ok) {
      console.error('Upstream storage error', upstream.status, text);
      return res.status(upstream.status).send(text);
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}`;

    // Return file metadata (do not auto-insert). The client should call /api/attachments to persist DB record.
    return res.json({ publicUrl, bucket, file_path: path });
  } catch (err: any) {
    console.error('Storage proxy error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Failed to upload to storage', details: err?.message || String(err) });
  }
};
