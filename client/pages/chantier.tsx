import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import projectService from "../lib/projectService";
import { toast } from "@/hooks/use-toast";

export default function ChantierPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chantier, setChantier] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  // form state for creation
  const [name, setName] = useState("");
  const [companyAssigned, setCompanyAssigned] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id || id === "new") return;
      const c = await projectService.fetchChantierById(id as string);
      setChantier(c || null);
      const t = await projectService.fetchTasks(id as string);
      setTasks(t || []);
    })();

    // load external companies for form
    (async () => {
      try {
        const comps = await projectService.fetchExternalCompanies();
        setCompanies(comps || []);
      } catch (e) {
        // ignore
      }
    })();
  }, [id]);

  async function recalc() {
    if (!id) return;
    await projectService.recalcChantierProgress(id);
    const c = await projectService.fetchChantierById(id as string);
    setChantier(c || null);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Erreur", description: "Le nom du chantier est requis" });
      return;
    }
    setSaving(true);
    try {
      const created = await projectService.createChantier({
        name: name.trim(),
        companyAssigned: companyAssigned || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        notes: notes || undefined,
      });
      toast({
        title: "Chantier créé",
        description: `Le chantier ${created.name} a été créé`,
      });
      navigate(`/chantier/${created.id}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible de créer le chantier",
      });
    } finally {
      setSaving(false);
    }
  };

  if (id === "new")
    return (
      <Layout>
        <h1 className="text-2xl">Nouveau chantier</h1>
        <div className="mt-4">
          <button className="btn" onClick={() => navigate("/chantiers")}>
            Retour
          </button>
        </div>

        <div className="card mt-6">
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Nom du chantier</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-input"
                />
              </div>

              <div>
                <label className="text-sm">Entreprise assignée</label>
                <select
                  value={companyAssigned}
                  onChange={(e) => setCompanyAssigned(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-input"
                >
                  <option value="">-- Aucune --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm">Date de début</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-input"
                />
              </div>

              <div>
                <label className="text-sm">Date de fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-input"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                className="btn-primary btn-sm"
                disabled={saving}
              >
                {saving ? "Création..." : "Créer"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => navigate("/chantiers")}
              >
                Annuler
              </button>
            </div>
          </form>
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
