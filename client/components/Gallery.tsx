import React, { useState } from "react";
import type { Attachment } from "@shared/api";

export default function Gallery({ items, onDelete, onUpload }: { items: Attachment[]; onDelete: (id: string) => void; onUpload: () => void; }) {
  const [lightbox, setLightbox] = useState<Attachment | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Galerie photos</h3>
        <div>
          <button onClick={onUpload} className="brand-btn">Téléverser une photo</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.id} className="relative bg-muted/20 rounded overflow-hidden">
            <img src={it.fileUrl} alt={it.fileType} className="w-full h-40 object-cover" onClick={() => setLightbox(it)} />
            <div className="p-2 text-xs text-muted">{new Date(it.uploadedAt || "").toLocaleString()} by {it.uploadedBy}</div>
            <button onClick={() => onDelete(it.id)} className="absolute top-2 right-2 bg-white rounded p-1 text-sm">🗑️</button>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setLightbox(null)}></div>
          <div className="z-10 max-w-3xl w-full p-4">
            <img src={lightbox.fileUrl} className="w-full h-auto rounded" />
            <div className="mt-2 text-sm text-muted">{lightbox.fileType} • {lightbox.uploadedBy}</div>
          </div>
        </div>
      )}
    </div>
  );
}
