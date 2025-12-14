export type UploadResult = { publicUrl: string; attachment?: any };

export async function uploadToServer(
  bucket: string,
  filePath: string,
  file: File,
  metadata?: { entity_type?: string; entity_id?: string | number; file_name?: string; file_type?: string },
): Promise<UploadResult> {
  const url = `/api/storage/upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(filePath)}`;

  const headers: Record<string, string> = {};
  if (metadata) {
    if (metadata.entity_type) headers["x-entity-type"] = String(metadata.entity_type);
    if (metadata.entity_id) headers["x-entity-id"] = String(metadata.entity_id);
    if (metadata.file_name) headers["x-file-name"] = String(metadata.file_name);
    if (metadata.file_type) headers["x-file-type"] = String(metadata.file_type);
  }

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  try {
    const data = await res.json();
    // Expect { publicUrl, attachment? }
    return data as UploadResult;
  } catch (e) {
    return { publicUrl: `/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(filePath)}` };
  }
}

export function generateFilePathForSite(siteId: number, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `sites/${siteId}/${Date.now()}-${safeName}`;
}

export async function uploadPhoto(file: File, siteId: number) {
  const bucket = "site-photos";
  const path = generateFilePathForSite(siteId, file);
  const result = await uploadToServer(bucket, path, file, { entity_type: "site", entity_id: siteId, file_name: file.name, file_type: file.type });
  return result;
}
