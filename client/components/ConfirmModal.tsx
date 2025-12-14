import React, { useEffect, useRef } from "react";

export default function ConfirmModal({ open, title, description, onCancel, onConfirm }: { open: boolean; title: string; description?: string; onCancel: () => void; onConfirm: () => void; }) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    // focus cancel button
    setTimeout(() => cancelRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="presentation">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden />
      <div role="dialog" aria-modal="true" aria-labelledby="confirmTitle" className="bg-card border border-border rounded-md p-6 z-10 w-full max-w-md">
        <h3 id="confirmTitle" className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted mt-2">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel} className="btn-secondary px-3 py-2 rounded-md text-sm">
            Annuler
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary px-3 py-2 rounded-md text-sm">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
