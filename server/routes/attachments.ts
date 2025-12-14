import express from "express";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const router = express.Router();

// Simple in-memory cache for signed URLs (fallback)
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

// Optional Redis client (lazy loaded if REDIS_URL provided)
let redisClient: any = null;
let redisInitTried = false;

async function getRedisClient() {
  if (redisClient) return redisClient;
  if (redisInitTried) return null;
  redisInitTried = true;
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL;
  if (!redisUrl) return null;
  try {
    const redisModule = await import('redis');
    // redis v4 client
    const client = redisModule.createClient({ url: redisUrl });
    client.on('error', (err: any) => console.warn('Redis client error', err));
    await client.connect();
    redisClient = client;
    console.log('Connected to Redis for signed URL caching');
    return redisClient;
  } catch (err) {
    console.warn('Failed to initialize redis client for signed url cache, falling back to in-memory cache', err);
    return null;
  }
}

async function getCachedSignedUrl(id: string) {
  // try Redis first
  const rc = await getRedisClient();
  if (rc) {
    try {
      const val = await rc.get(`attachment:signed:${id}`);
      if (!val) return null;
      const parsed = JSON.parse(val);
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) return parsed;
      // expired
      await rc.del(`attachment:signed:${id}`).catch(() => {});
      return null;
    } catch (e) {
      return null;
    }
  }
  // fallback to in-memory
  const cached = signedUrlCache.get(id);
  if (cached && cached.expiresAt > Date.now()) return cached;
  return null;
}

async function setCachedSignedUrl(id: string, url: string, expiresInSeconds: number) {
  const expiresAt = Date.now() + Math.max(5000, (expiresInSeconds - 5) * 1000);
  const rc = await getRedisClient();
  if (rc) {
    try {
      const payload = JSON.stringify({ url, expiresAt });
      await rc.set(`attachment:signed:${id}`, payload, { EX: Math.max(5, Math.floor((expiresInSeconds - 5))) });
      return;
    } catch (e) {
      // ignore and fallback
    }
  }
  signedUrlCache.set(id, { url, expiresAt });
}

async function invalidateCachedSignedUrl(id: string) {
  const rc = await getRedisClient();
  if (rc) {
    try { await rc.del(`attachment:signed:${id}`); } catch (e) { /* ignore */ }
  }
  signedUrlCache.delete(id);
}

// GET /api/attachments/:id/url -> generate signed URL for private bucket
router.get('/:id/url', async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'Missing attachment ID' });

  // Return cached url if still valid
  const cached = await getCachedSignedUrl(id);
  if (cached && (cached as any).url) {
    return res.json({ url: (cached as any).url, cached: true, expiresAt: (cached as any).expiresAt });
  }
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'Missing attachment ID' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const selectUrl = `${SUPABASE_URL}/rest/v1/attachments?id=eq.${encodeURIComponent(id)}&select=id,bucket,file_path`;
    const r = await fetch(selectUrl, { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
    const text = await r.text();
    if (!r.ok) {
      console.error('Supabase error fetching attachment for signed url:', r.status, text);
      return res.status(r.status).send(text);
    }
    const attachments = JSON.parse(text);
    const attachment = Array.isArray(attachments) && attachments.length ? attachments[0] : null;
    if (!attachment || !attachment.bucket || !attachment.file_path) return res.status(404).json({ error: 'Attachment not found or missing storage info' });

    // request signed url from Supabase Storage REST
    const signUrl = `${SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(attachment.bucket)}/${encodeURIComponent(attachment.file_path)}`;
    const signResp = await fetch(signUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ expires_in: 3600 }),
    });

    const signText = await signResp.text();
    if (!signResp.ok) {
      console.error('Failed to get signed url:', signResp.status, signText);
      return res.status(signResp.status).send(signText);
    }

    const signJson = JSON.parse(signText);
    const url = signJson.signedURL || signJson.signed_url || signJson.url || signJson;
    // Determine expiry (use expires_in if provided, otherwise default to 3600s)
    const expiresIn = typeof signJson.expires_in === 'number' ? signJson.expires_in : 3600;

    await setCachedSignedUrl(id, url, expiresIn);

    return res.json({ url, expiresIn });
  } catch (err: any) {
    console.error('Signed url generation failed:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal server error generating signed url', details: err?.message || String(err) });
  }
});

// DELETE /api/attachments/:id
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "Missing attachment ID" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured");
    return res.status(500).json({ error: "Server not configured" });
  }

  try {
    // 1. Fetch attachment record to get bucket and file_path
    const selectUrl = `${SUPABASE_URL}/rest/v1/attachments?id=eq.${encodeURIComponent(id)}&select=id,bucket,file_path`;
    const r = await fetch(selectUrl, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("Supabase error fetching attachment:", r.status, text);
      return res.status(r.status).send(text);
    }

    const attachments = JSON.parse(text);
    const attachment = Array.isArray(attachments) && attachments.length ? attachments[0] : null;

    if (!attachment || !attachment.bucket || !attachment.file_path) {
      return res.status(404).json({ error: "Attachment not found or missing storage info" });
    }

    // 2. Delete file from Supabase Storage
    const storageDeleteUrl = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(attachment.bucket)}/${encodeURIComponent(attachment.file_path)}`;
    const storageResp = await fetch(storageDeleteUrl, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!storageResp.ok) {
      const storageText = await storageResp.text();
      console.error('Failed to delete file from Supabase Storage:', storageResp.status, storageText);
      return res.status(storageResp.status).send(storageText);
    }

    // 3. Delete attachment record from Supabase DB
    const dbDeleteUrl = `${SUPABASE_URL}/rest/v1/attachments?id=eq.${encodeURIComponent(id)}`;
    const dbResp = await fetch(dbDeleteUrl, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!dbResp.ok) {
      const dbText = await dbResp.text();
      console.error('Failed to delete attachment record from DB:', dbResp.status, dbText);
      return res.status(dbResp.status).send(dbText);
    }

    // Invalidate cached signed url for this attachment (if any)
    try {
      await invalidateCachedSignedUrl(id);
    } catch (e) {
      // ignore
    }

    return res.status(204).send(); // No content on successful deletion

  } catch (err: any) {
    console.error('Attachment deletion failed:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal server error during attachment deletion', details: err?.message || String(err) });
  }
});

export default router;
