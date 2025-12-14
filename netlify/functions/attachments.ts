import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import Busboy from "busboy";

export const handler: Handler = async (event) => {
  try {
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
