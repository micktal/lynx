import React from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./ui/DarkModeToggle";
import MobileBottomNav from "./mobile/MobileBottomNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = React.useState<string>("spaces");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="border-b"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-card)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="container mx-auto flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold"
                style={{ background: "var(--primary)" }}
              >
                SB
              </div>
              <div>
                <div className="text-lg font-semibold" style={{ color: "var(--text)" }}>SecureBase</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Gestion d’audits</div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 px-6">
            <input
              aria-label="Rechercher"
              placeholder="Rechercher des sites, villes, contacts..."
              className="w-full px-4 py-2 rounded-md border border-border bg-input text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/" className="text-sm" style={{ color: "var(--text-muted)" }}>Sites</Link>
              <Link to="/map-france" className="text-sm" style={{ color: "var(--text-muted)" }}>Carte</Link>
              <Link to="/synthese" className="text-sm" style={{ color: "var(--text-muted)" }}>Synthèse</Link>
              <Link to="/audit" className="text-sm" style={{ color: "var(--text-muted)" }}>Audits</Link>
            </nav>

            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <div className="flex items-center gap-2 px-3 py-1 rounded-md" style={{ border: "1px solid var(--border)" }}>
                <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center" style={{ color: "var(--text)" }}>MK</div>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8" style={{ maxWidth: "var(--content-max-width)" }}>
        <div className="md:flex md:gap-6">
          <aside className="hidden md:block" style={{ width: "var(--sidebar-width)" }}>
            <div className="sidebar-premium card">
              <nav className="flex flex-col gap-2">
                <Link to="/" className="text-sm" style={{ color: "var(--text)" }}>Sites</Link>
                <Link to="/map-france" className="text-sm" style={{ color: "var(--text)" }}>Carte France</Link>
                <Link to="/synthese" className="text-sm" style={{ color: "var(--text)" }}>Synthèse</Link>
                <Link to="/audit" className="text-sm" style={{ color: "var(--text)" }}>Audits</Link>
                <Link to="/reporting" className="text-sm" style={{ color: "var(--text)" }}>Reporting</Link>
              </nav>
            </div>
          </aside>

          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </div>

        <footer className="mt-12 border-t pt-6" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col md:flex-row md:justify-between gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
            <div>© {new Date().getFullYear()} SecureBase — Gestion d’audits de sécurité</div>
            <div className="flex gap-4">
              <Link to="/privacy" style={{ color: "var(--text-muted)" }}>Confidentialité</Link>
              <Link to="/terms" style={{ color: "var(--text-muted)" }}>Conditions</Link>
              <a href="#" style={{ color: "var(--text-muted)" }}>Support</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <MobileBottomNav value={mobileNav} onChange={(v) => setMobileNav(v)} />
      </div>
    </div>
  );
}
