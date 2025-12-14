import { RequestHandler } from "express";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://juyownedgwfbigbwofxx.supabase.com";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const handleAttachmentsCreate: RequestHandler = async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'Invalid body' });

  if (!SERVICE_KEY) return res.status(500).json({ error: 'Service role key not configured' });

  try {
    const insertUrl = `${SUPABASE_URL}/rest/v1/attachments`;
    const r = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).send(text);
    }

    const data = JSON.parse(text);
    // Supabase returns an array when using return=representation
    return res.json(Array.isArray(data) ? data[0] : data);
  } catch (err: any) {
    console.error('Attachments create error', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Failed to create attachment record', details: err?.message || String(err) });
  }
};
