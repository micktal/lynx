import React from "react";
import { useLocation } from "react-router-dom";

export default function Hero() {
  const loc = useLocation();
  // show only on index or dashboard
  if (loc.pathname !== "/index" && loc.pathname !== "/dashboard") return null;

  return (
    <div className="w-full" style={{ position: "relative", marginBottom: 12 }}>
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(10,132,255,0.08), rgba(32,201,151,0.06))",
          height: 160,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          padding: "24px 0",
        }}
      >
        <div
          className="container mx-auto px-4"
          style={{ maxWidth: "var(--content-max-width)" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "hsl(var(--brand))" }}
              >
                ROEH — Security Inspection & Risk Intelligence
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                Plateforme interne pour la gestion des sites, audits et
                équipements.
              </p>
            </div>
            <div className="hidden sm:flex gap-3">
              <button className="btn-primary px-4 py-2 rounded-md">
                Démarrer une recherche
              </button>
              <button className="btn-ghost px-4 py-2 rounded-md">
                Ouvrir le dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* decorative circular accents */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 8,
          width: 90,
          height: 90,
          borderRadius: 9999,
          background: "rgba(91,140,255,0.06)",
          filter: "blur(18px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 24,
          top: 24,
          width: 60,
          height: 60,
          borderRadius: 9999,
          background: "rgba(32,201,151,0.06)",
          filter: "blur(12px)",
          zIndex: 0,
        }}
      />
    </div>
  );
}
