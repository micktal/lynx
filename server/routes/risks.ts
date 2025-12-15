import express from "express";
import fetch from "node-fetch";
import { enforceRules } from "../middleware/enforceRules";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const router = express.Router();

// Update risk
router.put("/:id", enforceRules("risk", "UPDATE"), async (req, res) => {
  const id = req.params.id;
  const payload = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(501).json({ error: "Supabase not configured on server" });
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/risks?id=eq.${encodeURIComponent(id)}`;
    const r = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text);
    const json = JSON.parse(text);
    return res.json(Array.isArray(json) ? json[0] : json);
  } catch (e: any) {
    console.error("PUT /api/risks/:id failed", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete risk
router.delete("/:id", enforceRules("risk", "DELETE"), async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Missing id" });
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(501).json({ error: "Supabase not configured on server" });
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/risks?id=eq.${encodeURIComponent(id)}`;
    const r = await fetch(url, {
      method: "DELETE",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: "return=minimal",
      },
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).send(text);
    }
    return res.status(204).send();
  } catch (e: any) {
    console.error("DELETE /api/risks/:id failed", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
