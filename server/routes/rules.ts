import express from 'express';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const router = express.Router();

// GET /api/rules?resource=...&action=...
router.get('/', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Server not configured' });
    }

    const qs: string[] = [];
    const { resource, action } = req.query as any;
    if (resource) qs.push(`resource=eq.${encodeURIComponent(resource)}`);
    if (action) qs.push(`action=eq.${encodeURIComponent(action)}`);

    // default select all columns, order by created_at desc
    const select = 'select=*';
    const q = qs.length ? '&' + qs.join('&') : '';
    const url = `${SUPABASE_URL}/rest/v1/rules?${select}${q}&order=created_at.desc`;

    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text);
    const json = JSON.parse(text);
    return res.json(json);
  } catch (err: any) {
    console.error('GET /api/rules failed', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal server error', details: err?.message || String(err) });
  }
});

// POST /api/rules
router.post('/', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Server not configured' });
    }

    const { resource, action, condition, only_roles, enabled } = req.body as any;
    if (!resource || !action || typeof condition === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields: resource, action, condition' });
    }

    // Build payload for Supabase
    const payload: any = {
      resource,
      action,
      condition: typeof condition === 'string' ? JSON.parse(condition) : condition,
      only_roles: Array.isArray(only_roles) ? only_roles : (only_roles ? String(only_roles).split(',').map((s:any)=>s.trim()) : []),
      enabled: typeof enabled === 'boolean' ? enabled : true,
    };

    const url = `${SUPABASE_URL}/rest/v1/rules`;
    const r = await fetch(url, {
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
    if (!r.ok) return res.status(r.status).send(text);
    const json = JSON.parse(text);
    // Supabase returns array of inserted rows
    return res.status(201).json(Array.isArray(json) ? json[0] : json);
  } catch (err: any) {
    console.error('POST /api/rules failed', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal server error', details: err?.message || String(err) });
  }
});

// DELETE /api/rules/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Server not configured' });
    }

    const url = `${SUPABASE_URL}/rest/v1/rules?id=eq.${encodeURIComponent(id)}`;
    const r = await fetch(url, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
      },
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).send(text);
    }

    return res.status(204).send();
  } catch (err: any) {
    console.error('DELETE /api/rules/:id failed', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal server error', details: err?.message || String(err) });
  }
});

export default router;
