import React from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white font-bold">SB</div>
            <div>
              <Link to="/" className="text-lg font-semibold text-card-foreground">
                SecureBase
              </Link>
              <div className="text-sm text-muted">Plateforme de gestion d’audits</div>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted hover:text-foreground">
              Sites
            </Link>
            <Link to="/synthese" className="text-sm text-muted hover:text-foreground">
              Synthèse
            </Link>
            <Link to="/audit" className="text-sm text-muted hover:text-foreground">
              Audits
            </Link>
            <button className="brand-btn">Nouveau site</button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8">{children}</main>

      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto text-sm text-muted">© {new Date().getFullYear()} SecureBase — Gestion d’audits de sécurité</div>
      </footer>
    </div>
  );
}
