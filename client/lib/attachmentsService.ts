export async function createAttachment(payload: {
  entity_type: "site" | "audit" | "risk" | "equipment" | "project" | "chantier" | "action";
  entity_id: number;
  // Either provide file_url (legacy) OR bucket + file_path
  file_url?: string;
  bucket?: string;
  file_path?: string;
  file_name?: string;
  file_type?: string;
}) {
  const res = await fetch("/api/attachments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to create attachment: ${res.status} ${txt}`);
  }

  return res.json();
}

export async function uploadAttachment(
  file: File,
  entity_type: "site" | "audit" | "risk" | "equipment",
  entity_id: number | string,
  onProgress?: (p: number) => void,
) {
  return new Promise<any>((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file, file.name);
    fd.append("entity_type", entity_type);
    fd.append("entity_id", String(entity_id));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/.netlify/functions/attachments");

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && onProgress) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        } catch (e) {
          resolve(xhr.responseText);
        }
      } else {
        // If serverless function not present (404) or upload failed, fallback to creating a placeholder attachment record
        if (xhr.status === 404) {
          try {
            const placeholder = await createAttachment({
              entity_type,
              entity_id: Number(entity_id),
              file_url: "/placeholder.svg",
              file_name: file.name,
              file_type: file.type,
            });
            return resolve(placeholder);
          } catch (e) {
            return reject(
              new Error(
                `Upload failed and fallback failed: ${xhr.status} ${xhr.responseText}`,
              ),
            );
          }
        }
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    };

    xhr.onerror = async () => {
      // network error - try fallback createAttachment
      try {
        const placeholder = await createAttachment({
          entity_type,
          entity_id: Number(entity_id),
          file_url: "/placeholder.svg",
          file_name: file.name,
          file_type: file.type,
        });
        return resolve(placeholder);
      } catch (e) {
        return reject(new Error("Network error during upload"));
      }
    };
    xhr.send(fd);
  });
}

export async function deleteAttachment(id: string) {
  if (!id) throw new Error("Missing attachment id");

  const res = await fetch(`/api/attachments/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to delete attachment: ${res.status} ${txt}`);
  }

  // Return nothing on success
  return true;
}
