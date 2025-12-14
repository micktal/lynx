import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  try {
    // =========================
    // METHOD CHECK
    // =========================
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // =========================
    // PARSE FORM DATA
    // =========================
    const contentType = (event.headers["content-type"] || event.headers["Content-Type"] || "") as string;
    if (!contentType.includes("multipart/form-data")) {
      return { statusCode: 400, body: "Invalid content-type" };
    }

    const boundary = contentType.split("boundary=")[1];
    const buffer = Buffer.from(event.body!, "base64");

    // Very small multipart parser (enough for file upload)
    const parts = buffer
      .toString()
      .split(`--${boundary}`)
      .filter((p) => p.includes("Content-Disposition"));

    const filePart = parts.find((p) => p.includes("filename="));
    const metaPart = parts.find((p) => p.includes("entity_type"));

    if (!filePart || !metaPart) {
      return { statusCode: 400, body: "Missing data" };
    }

    const filenameMatch = filePart.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : "file";

    const fileBuffer = Buffer.from(
      filePart.split("\r\n\r\n")[1].split("\r\n")[0],
      "binary"
    );

    const getValue = (key: string) => {
      const m = metaPart.match(new RegExp(`${key}"\\r\\n\\r\\n(.+)\\r\\n`));
      return m ? m[1] : null;
    };

    const entityType = getValue("entity_type");
    const entityId = getValue("entity_id");

    if (!entityType || !entityId) {
      return { statusCode: 400, body: "Missing entity data" };
    }

    // =========================
    // BUCKET + PATH
    // =========================
    const bucket = `${entityType}-photos`;
    const filePath = `${entityType}/${entityId}/${randomUUID()}-${filename}`;

    // =========================
    // UPLOAD TO SUPABASE
    // =========================
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: "image/*",
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      return { statusCode: 500, body: "Upload failed" };
    }

    // =========================
    // SAVE METADATA IN DB
    // =========================
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
      return { statusCode: 500, body: "DB insert failed" };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(attachment),
    };
  } catch (err: any) {
    console.error(err);
    return { statusCode: 500, body: err.message };
  }
};
