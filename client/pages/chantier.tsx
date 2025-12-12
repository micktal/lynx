import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import projectService from "../lib/projectService";

export default function ChantierPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chantier, setChantier] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      if (!id || id === "new") return;
      const c = await projectService.fetchChantierById(id as string);
      setChantier(c || null);
      const t = await projectService.fetchTasks(id as string);
      setTasks(t || []);
    })();
  }, [id]);

  async function recalc() {
    if (!id) return;
    await projectService.recalcChantierProgress(id);
    const c = await projectService.fetchChantierById(id as string);
    setChantier(c || null);
  }

  if (id === "new")
    return (
      <Layout>
        <h1 className="text-2xl">Nouveau chantier (formulaire)</h1>
        <div className="mt-4">
          <button className="btn" onClick={() => navigate("/chantiers")}>
            Retour
          </button>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{chantier?.name || "Chantier"}</h1>
          <div className="text-sm text-muted">{chantier?.notes}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={recalc}>
            Recalculer tâches
          </button>
          <Link to="/chantiers" className="btn-ghost">
            Retour
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="text-sm text-muted">État</div>
        <div className="font-medium">{chantier?.status}</div>
        <div className="mt-4">
          <h3 className="font-semibold">Tâches</h3>
          <div className="mt-3 space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-card-2 rounded-md flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-muted">
                    {t.assignee} • {t.priority}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{t.progression || 0}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
