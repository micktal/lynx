import express from "express";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const router = express.Router();

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

    return res.status(204).send(); // No content on successful deletion

  } catch (err: any) {
    console.error('Attachment deletion failed:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal server error during attachment deletion', details: err?.message || String(err) });
  }
});

export default router;
