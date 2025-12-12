import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import projectService from "../lib/projectService";

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [chantiers, setChantiers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      if (!id || id === "new") return;
      const p = await projectService.fetchProjectById(id as string);
      setProject(p || null);
      const ch = await projectService.fetchChantiers(id as string);
      setChantiers(ch || []);
    })();
  }, [id]);

  async function handleRecalc() {
    if (!id) return;
    await projectService.recalcProjectProgress(id);
    const p = await projectService.fetchProjectById(id as string);
    setProject(p || null);
  }

  if (id === "new") {
    return (
      <Layout>
        <h1 className="text-2xl font-bold">Créer un nouveau projet</h1>
        <div className="card mt-4">Formulaire minimal (à compléter)</div>
        <div className="mt-4">
          <button className="btn" onClick={() => navigate("/projects")}>
            Retour
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{project?.name || "Projet"}</h1>
          <div className="text-sm text-muted">{project?.description}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={handleRecalc}>
            Recalculer progression
          </button>
          <Link to="/projects" className="btn-ghost">
            Retour
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-muted">Statut</div>
          <div className="font-medium">{project?.status}</div>
          <div className="text-sm text-muted mt-2">Progression</div>
          <div className="font-bold">{project?.progression || 0}%</div>
        </div>

        <div className="md:col-span-2 card">
          <h3 className="font-semibold">Chantiers</h3>
          <div className="mt-3 space-y-3">
            {chantiers.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-card-2 rounded-md flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-muted">{c.companyAssigned}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted">Progression</div>
                  <div className="font-semibold">{c.progression || 0}%</div>
                  <div className="mt-2">
                    <Link to={`/chantier/${c.id}`} className="text-sm">
                      Ouvrir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
