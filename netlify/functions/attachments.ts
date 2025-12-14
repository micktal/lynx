import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import Busboy from "busboy";

export const handler: Handler = async (event) => {
  try {
    // Health-check endpoint for GET
    if (event.httpMethod === "GET") {
      const results: any = { ok: true };
      // Supabase check
      try {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          results.supabase = { ok: false, error: 'env missing' };
        } else {
          const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
          const { data, error } = await supabase.from('attachments').select('id').limit(1);
          results.supabase = { ok: !error, error: error ? String(error) : null, sample: Array.isArray(data) ? data.length : 0 };
        }
      } catch (e: any) {
        results.supabase = { ok: false, error: String(e?.message || e) };
      }

      // Redis check (optional)
      try {
        const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL;
        if (!redisUrl) {
          results.redis = { ok: false, error: 'no REDIS_URL' };
        } else {
          try {
            const redisModule = await import('redis');
            const client = redisModule.createClient({ url: redisUrl });
            client.on('error', () => {});
            await client.connect();
            const pong = await client.ping();
            await client.disconnect();
            results.redis = { ok: pong === 'PONG' || pong === 'OK', pong };
          } catch (re) {
            results.redis = { ok: false, error: String(re) };
          }
        }
      } catch (e: any) {
        results.redis = { ok: false, error: String(e?.message || e) };
      }

      return { statusCode: 200, body: JSON.stringify(results) };
    }

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const contentType = (event.headers["content-type"] || event.headers["Content-Type"] || "") as string;
    if (!contentType.includes("multipart/form-data")) {
      return { statusCode: 400, body: "Invalid content-type" };
    }

    const buffer = Buffer.from(event.body || "", event.isBase64Encoded ? "base64" : "utf8");

    return await new Promise((resolve) => {
      const bb = new Busboy({ headers: { "content-type": contentType } as any });

      let fileBuffer: Buffer | null = null;
      let filename = "file";
      const fields: Record<string, string> = {};

      bb.on("file", (_name, stream, info) => {
        filename = info?.filename || filename;
        const chunks: Buffer[] = [];
        stream.on("data", (d: Buffer) => chunks.push(d));
        stream.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on("field", (name, val) => {
        fields[name] = String(val);
      });

      bb.on("finish", async () => {
        try {
          if (!fileBuffer) return resolve({ statusCode: 400, body: "Missing file" });

          const entityType = fields["entity_type"];
          const entityId = fields["entity_id"];

          if (!entityType || !entityId) {
            return resolve({ statusCode: 400, body: "Missing entity data" });
          }

          const bucket = `${entityType}-photos`;
          const filePath = `${entityType}/${entityId}/${randomUUID()}-${filename}`;

          const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

          const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
            contentType: "image/*",
            upsert: false,
          });

          if (uploadError) {
            console.error(uploadError);
            return resolve({ statusCode: 500, body: "Upload failed" });
          }

          const { data: attachment, error: dbError } = await supabase
            .from("attachments")
            .insert({
              entity_type: entityType,
              entity_id: Number(entityId),
              bucket,
              file_path: filePath,
              file_name: filename,
              file_type: "image",
            })
            .select()
            .single();

          if (dbError) {
            console.error(dbError);
            // attempt cleanup
            try {
              await supabase.storage.from(bucket).remove([filePath]);
            } catch (e) {
              console.warn("Failed to cleanup uploaded file after DB error", e);
            }
            return resolve({ statusCode: 500, body: "DB insert failed" });
          }

          return resolve({ statusCode: 200, body: JSON.stringify(attachment) });
        } catch (err: any) {
          console.error(err);
          return resolve({ statusCode: 500, body: String(err?.message || err) });
        }
      });

      // feed buffer to busboy
      bb.end(buffer);
    });
  } catch (err: any) {
    console.error(err);
    return { statusCode: 500, body: String(err?.message || err) };
  }
};
