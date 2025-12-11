import React from "react";

export default function ConfirmModal({ open, title, description, onCancel, onConfirm }: { open: boolean; title: string; description?: string; onCancel: () => void; onConfirm: () => void; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel}></div>
      <div className="bg-card border border-border rounded-md p-6 z-10 w-full max-w-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted mt-2">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded-md border border-border text-sm">
            Annuler
          </button>
          <button onClick={onConfirm} className="brand-btn">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
