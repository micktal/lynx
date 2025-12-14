export async function createAttachment(payload: {
  entity_type: "site" | "audit" | "risk" | "equipment";
  entity_id: number;
  // Either provide file_url (legacy) OR bucket + file_path
  file_url?: string;
  bucket?: string;
  file_path?: string;
  file_name?: string;
  file_type?: string;
}) {
  const res = await fetch('/api/attachments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to create attachment: ${res.status} ${txt}`);
  }

  return res.json();
}
