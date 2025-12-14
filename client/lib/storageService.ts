export type UploadResult = { publicUrl: string; attachment?: any };

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function generateFilePath(entityType: string, entityId: string | number, file: File) {
  const base = `${entityType}s`;
  const idPart = String(entityId);
  return `${base}/${idPart}/${Date.now()}-${safeName(file.name)}`;
}

function bucketForEntity(entityType: string) {
  switch (entityType) {
    case 'site': return 'site-photos';
    case 'audit': return 'audit-photos';
    case 'risk': return 'risk-photos';
    case 'equipment': return 'equipment-photos';
    default: return 'site-photos';
  }
}

export function uploadPhoto(
  file: File,
  entityType: string,
  entityId: string | number,
  onProgress?: (p: number) => void,
): Promise<UploadResult> {
  const bucket = bucketForEntity(entityType);
  const path = generateFilePath(entityType, entityId, file);
  const url = `/api/storage/upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    // set some file headers (not entity metadata)
    xhr.setRequestHeader('x-file-name', file.name);
    xhr.setRequestHeader('x-file-type', file.type || '');

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          // data: { publicUrl, bucket, file_path }
          resolve(data as UploadResult);
        } catch (e) {
          resolve({ publicUrl: `/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}` });
        }
      } else {
        reject(new Error(`Upload failed ${xhr.status}: ${xhr.responseText}`));
      }
    };

    xhr.onerror = function() {
      reject(new Error('Network error during upload'));
    };

    xhr.send(file);
  });
}
