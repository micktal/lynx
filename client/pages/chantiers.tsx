import React, { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import projectService from "../lib/projectService";
import { Link, useNavigate } from "react-router-dom";

export default function ChantiersPage() {
  const [chantiers, setChantiers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const ch = await projectService.fetchChantiers();
      setChantiers(ch || []);
    })();
  }, []);

  const progressionBadge = (p: number | undefined) => {
    const val = p || 0;
    if (val >= 100) return <span className="px-2 py-1 rounded text-white text-xs" style={{ background: '#16a34a' }}>{val}%</span>;
    if (val >= 50) return <span className="px-2 py-1 rounded text-white text-xs" style={{ background: '#f59e0b' }}>{val}%</span>;
    return <span className="px-2 py-1 rounded text-white text-xs" style={{ background: '#3b82f6' }}>{val}%</span>;
  };

  if (!chantiers || chantiers.length === 0) {
    return (
      <Layout>
        <div className="card text-center" style={{ color: 'var(--text)' }}>
          <div className="text-lg font-semibold">Aucun chantier trouvé</div>
          <div className="text-sm mt-2 mb-4">Il n'y a pas de chantiers pour le moment.</div>
          <div>
            <Link to="/chantier/new" className="btn-primary btn-sm">Créer chantier</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Chantiers</h1>
          <div className="text-sm" style={{ color: 'var(--text)' }}>Liste des chantiers</div>
        </div>
        <div>
          <Link to="/chantier/new" className="btn btn-premium">
            Créer chantier
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chantiers.map((c) => (
          <div
            key={c.id}
            className="card card-clickable cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/chantier/${c.id}`)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/chantier/${c.id}`); }}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <div className="text-sm" style={{ color: 'var(--text)' }}>{c.companyAssigned}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{c.progression || 0}%</div>
                <div className="text-sm mt-2">
                  <Link onClick={(e) => e.stopPropagation()} to={`/chantier/${c.id}`} className="btn-primary btn-sm">Ouvrir</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
