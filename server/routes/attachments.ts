import express from "express";

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST /api/attachments
// Body: { entity_type, entity_id, file_url, file_name?, file_type? }
router.post('/', async (req, res) => {
  try {
    const { entity_type, entity_id, file_url, file_name, file_type, bucket, file_path } = req.body as any;

    if (!entity_type || !entity_id || !(file_url || (bucket && file_path))) {
      return res.status(400).json({ error: 'Missing required fields (entity_type, entity_id, file_url or bucket+file_path)' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
      return res.status(500).json({ error: 'Server not configured' });
    }

    const payload: any = {
      entity_type,
      entity_id,
      file_name: file_name || null,
      file_type: file_type || null,
      bucket: bucket || null,
      file_path: file_path || null,
      file_url: file_url || null,
    };

    const insertUrl = `${SUPABASE_URL}/rest/v1/attachments`;
    const r = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      console.error('Supabase error inserting attachment:', text);
      return res.status(r.status).send(text);
    }

    const data = JSON.parse(text);
    return res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('Attachment creation failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/attachments/:id/url -> returns signed URL for private storage
router.get('/:id/url', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server not configured' });

    // fetch attachment record
    const selectUrl = `${SUPABASE_URL}/rest/v1/attachments?id=eq.${encodeURIComponent(id)}&select=*`;
    const r = await fetch(selectUrl, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).send(txt);
    }
    const arr = await r.json();
    const att = Array.isArray(arr) && arr.length ? arr[0] : null;
    if (!att) return res.status(404).json({ error: 'Attachment not found' });

    const bucket = att.bucket;
    const file_path = att.file_path;
    if (!bucket || !file_path) return res.status(400).json({ error: 'Attachment missing bucket or file_path' });

    // call supabase storage sign endpoint
    const signUrl = `${SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodeURIComponent(file_path)}`;
    const signResp = await fetch(signUrl, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    });

    if (!signResp.ok) {
      const txt = await signResp.text();
      console.error('Failed to create signed url', signResp.status, txt);
      return res.status(signResp.status).send(txt);
    }

    const signData = await signResp.json();
    // supabase may return { signedURL } or { signed_url }
    const url = signData.signedURL || signData.signed_url || signData.signedUrl || signData?.url || signData;
    return res.json({ url });
  } catch (err) {
    console.error('Error generating signed url', err);
    return res.status(500).json({ error: 'Failed to generate signed url' });
  }
});

export default router;
