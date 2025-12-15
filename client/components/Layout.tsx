import React from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./ui/DarkModeToggle";
import MobileBottomNav from "./mobile/MobileBottomNav";
import MobileDrawer from "./mobile/MobileDrawer";
const Hero: any = null;

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = React.useState<string>("spaces");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [HeroComponent, setHeroComponent] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('./Hero');
        if (mounted && mod && mod.default) setHeroComponent(() => mod.default);
      } catch (e) {
        // failed to load hero - ignore
        console.warn('Failed to load Hero component', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:block p-2" style={{position:'absolute',left:8,top:8,zIndex:60}}>Aller au contenu</a>
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
              <img src="https://cdn.builder.io/api/v1/image/assets%2Fd93d9a0ec7824aa1ac4d890a1f90a2ec%2F55a8c512fb5d4bb38b0292e3757d0114?format=webp&width=400" alt="ROEH logo" className="w-14 h-14 rounded-md object-contain" style={{ background: 'transparent' }} />
              <div>
                <div className="text-lg font-semibold" style={{ color: "hsl(var(--brand))" }}>ROEH</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Security Inspection & Risk Intelligence Platform</div>
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

          <div className="md:hidden flex items-center gap-2">
            <button aria-label="Ouvrir le menu" className="px-2 py-2 rounded-md" onClick={() => setDrawerOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Decorative hero (gradient + shapes) shown only on home */}
      {HeroComponent ? <HeroComponent /> : null}

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

          <main id="main-content" className="flex-1 pb-20 md:pb-0">{children}</main>
        </div>

        <footer className="mt-12 border-t pt-6" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col md:flex-row md:justify-between gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
            <div>© {new Date().getFullYear()} ROEH — Security Inspection & Risk Intelligence Platform</div>
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

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
