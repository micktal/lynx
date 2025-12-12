import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import projectService from "../lib/projectService";
import { Link } from "react-router-dom";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const p = await projectService.fetchProjects();
      setProjects(p || []);
    })();
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Projets</h1>
          <div className="text-sm text-muted">
            Gestion multi-projets & multi-chantiers
          </div>
        </div>
        <div>
          <Link to="/project/new" className="btn btn-premium">
            Créer un projet
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <div className="text-sm text-muted">{p.description}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted">Progression</div>
                <div className="font-bold">{p.progression || 0}%</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link to={`/project/${p.id}`} className="btn">
                Ouvrir
              </Link>
              <button
                className="btn-ghost"
                onClick={async () => {
                  await projectService.recalcProjectProgress(p.id);
                  const ps = await projectService.fetchProjects();
                  setProjects(ps);
                }}
              >
                Recalculer
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
