import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    // focus the close button when opening
    setTimeout(() => {
      closeRef.current?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        // simple focus trap: keep focus within drawer
        const focusable = Array.from(
          (document.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ) as NodeListOf<HTMLElement>),
        ).filter((el) => el.offsetParent !== null && el.closest("aside[data-drawer]") );
        // if no focusable, return
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          (last as HTMLElement).focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          (first as HTMLElement).focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div>
      <div
        className="fixed inset-0 bg-black/40"
        style={{ zIndex: 90 }}
        onClick={onClose}
        aria-hidden
      />

      <aside
        data-drawer
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="fixed left-0 top-0 bottom-0 w-64 bg-card p-4"
        style={{ zIndex: 100, boxShadow: "2px 0 30px rgba(2,6,23,0.12)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">SecureBase</div>
          <button ref={closeRef} onClick={onClose} aria-label="Fermer le menu" className="px-2 py-1 rounded-md border border-border">✕</button>
        </div>

        <nav className="flex flex-col gap-3">
          <Link ref={firstLinkRef} to="/" onClick={onClose} className="py-2 px-2 rounded-md text-sm" style={{ color: "var(--text)" }}>Sites</Link>
          <Link to="/map-france" onClick={onClose} className="py-2 px-2 rounded-md text-sm" style={{ color: "var(--text)" }}>Carte France</Link>
          <Link to="/synthese" onClick={onClose} className="py-2 px-2 rounded-md text-sm" style={{ color: "var(--text)" }}>Synthèse</Link>
          <Link to="/audit" onClick={onClose} className="py-2 px-2 rounded-md text-sm" style={{ color: "var(--text)" }}>Audits</Link>
          <Link to="/reporting" onClick={onClose} className="py-2 px-2 rounded-md text-sm" style={{ color: "var(--text)" }}>Reporting</Link>
          <Link to="/notifications" onClick={onClose} className="py-2 px-2 rounded-md text-sm" style={{ color: "var(--text)" }}>Notifications</Link>
        </nav>

        <div className="mt-6">
          <div className="text-xs text-muted mb-2">Theme</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                document.documentElement.classList.remove("dark");
                onClose();
              }}
              className="px-3 py-2 rounded-md border border-border text-sm"
            >
              Clair
            </button>
            <button
              onClick={() => {
                document.documentElement.classList.add("dark");
                onClose();
              }}
              className="px-3 py-2 rounded-md border border-border text-sm"
            >
              Sombre
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
