import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [confidentiality, setConfidentiality] = useState("Public");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setClients(await builder.fetchClients());
    })();
  }, []);

  useEffect(() => {
    if (!logoFile) return setLogoPreview(null);
    const fr = new FileReader();
    fr.onload = () => setLogoPreview(String(fr.result));
    fr.readAsDataURL(logoFile);
  }, [logoFile]);

  async function handleCreate() {
    if (!name.trim()) return alert("Nom requis");
    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        industry: industry || undefined,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        address: address || undefined,
        postalCode: postalCode || undefined,
        confidentiality: confidentiality || undefined,
      };
      if (logoPreview) payload.logoUrl = logoPreview;
      await builder.createClient(payload);
      setClients(await builder.fetchClients());
      setShowCreate(false);
      // reset form
      setName("");
      setIndustry("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setAddress("");
      setPostalCode("");
      setConfidentiality("Public");
      setLogoFile(null);
      setLogoPreview(null);
    } catch (e) {
      console.error(e);
      alert("Erreur création client");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des clients</h1>
          <div className="text-sm" style={{ color: "var(--text)" }}>
            Créer et gérer les portails clients
          </div>
        </div>
        <div>
          <button onClick={() => setShowCreate(true)} className="btn">
            + Ajouter un client
          </button>
        </div>
      </div>

      <div className="card p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left">
              <th>Logo</th>
              <th>Nom</th>
              <th>Secteur</th>
              <th>Sites</th>
              <th>Utilisateurs</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-2">
                  <img
                    src={c.logoUrl || "/placeholder.svg"}
                    alt="logo"
                    style={{ width: 40 }}
                  />
                </td>
                <td style={{ color: "var(--text)" }}>{c.name}</td>
                <td style={{ color: "var(--text)" }}>{c.industry || "-"}</td>
                <td style={{ color: "var(--text)" }}>-</td>
                <td style={{ color: "var(--text)" }}>-</td>
                <td style={{ color: "var(--text)" }}>
                  {c.active ? "Actif" : "Archivé"}
                </td>
                <td>
                  <a className="btn-sm" href={`/clients/${c.id}`}>
                    Ouvrir
                  </a>{" "}
                  <a
                    className="btn-sm"
                    href={`/client-portal?clientId=${c.id}`}
                  >
                    Portail
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-card rounded p-4 w-full max-w-2xl">
            <h2 className="text-lg font-semibold mb-3">Créer un client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Nom</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full input"
                />
              </div>
              <div>
                <label className="text-sm">Secteur</label>
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full input"
                />
              </div>
              <div>
                <label className="text-sm">Contact (nom)</label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full input"
                />
              </div>
              <div>
                <label className="text-sm">Contact (email)</label>
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full input"
                />
              </div>
              <div>
                <label className="text-sm">Contact (téléphone)</label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full input"
                />
              </div>

              <div>
                <label className="text-sm">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt="preview"
                      style={{ width: 80 }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={() => setShowCreate(false)}>
                Annuler
              </button>
              <button
                className="btn-primary btn-sm"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
