export async function uploadToServer(bucket: string, filePath: string, file: File) {
  // Upload binary to server route which proxies to Supabase Storage
  const url = `/api/storage/upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(filePath)}`;
  const headers: Record<string,string> = {};
  if (metadata) {
    if (metadata.entity_type) headers['x-entity-type'] = String(metadata.entity_type);
    if (metadata.entity_id) headers['x-entity-id'] = String(metadata.entity_id);
    if (metadata.file_name) headers['x-file-name'] = String(metadata.file_name);
    if (metadata.file_type) headers['x-file-type'] = String(metadata.file_type);
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    // Let browser set Content-Type for file
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  try {
    const data = await res.json();
    if (data && data.publicUrl) return data.publicUrl;
  } catch (e) {
    // fallthrough
  }

  // fallback (not ideal)
  return `/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(filePath)}`;
}

export function generateFilePathForSite(siteId: number, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `sites/${siteId}/${Date.now()}-${safeName}`;
}

export async function uploadPhoto(file: File, siteId: number) {
  const bucket = 'site-photos';
  const path = generateFilePathForSite(siteId, file);
  const publicUrl = await uploadToServer(bucket, path, file);
  return publicUrl;
}
