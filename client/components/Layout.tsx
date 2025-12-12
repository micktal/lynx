import React from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./ui/DarkModeToggle";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="border-b"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-card)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div className="container mx-auto flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold"
              style={{ background: "var(--primary)" }}
            >
              SB
            </div>
            <div>
              <Link
                to="/"
                className="text-lg font-semibold"
                style={{ color: "var(--text)" }}
              >
                SecureBase
              </Link>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                Plateforme de gestion d’audits
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Sites
            </Link>
            <Link
              to="/map-france"
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Carte France
            </Link>
            <Link
              to="/map-france-airbnb"
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Carte (Airbnb)
            </Link>
            <Link
              to="/synthese"
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Synthèse
            </Link>
            <Link
              to="/audit"
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Audits
            </Link>
            <Link
              to="/reporting"
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Reporting
            </Link>
            <Link
              to="/notifications"
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Notifications
            </Link>
            <DarkModeToggle />
          </nav>
        </div>
      </header>

      <main
        className="container mx-auto py-8"
        style={{ maxWidth: "var(--content-max-width)" }}
      >
        {children}
      </main>

      <footer
        className="border-t"
        style={{
          borderColor: "var(--border)",
          paddingTop: "1.5rem",
          marginTop: "3rem",
        }}
      >
        <div
          className="container mx-auto text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          © {new Date().getFullYear()} SecureBase — Gestion d’audits de
          sécurité
        </div>
      </footer>
    </div>
  );
}
