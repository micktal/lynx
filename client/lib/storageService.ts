export async function uploadToServer(bucket: string, filePath: string, file: File) {
  // Upload binary to server route which proxies to Supabase Storage
  const url = `/api/storage/upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(filePath)}`;
  const res = await fetch(url, {
    method: 'PUT',
    // Let browser set Content-Type for file
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  const SUPABASE_URL = (window as any).__SUPABASE_URL || '';
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(filePath)}`;
  return publicUrl;
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
