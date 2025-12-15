import React from "react";
import { toast } from "@/hooks/use-toast";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { UserExtended } from "@shared/api";
import { useNavigate } from "react-router-dom";

const ROLES = [
  { id: "role_admin", label: "ADMIN" },
  { id: "role_manager", label: "MANAGER" },
  { id: "role_auditeur", label: "AUDITEUR" },
  { id: "role_user", label: "USER" },
];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [items, setItems] = React.useState<UserExtended[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [newUserId, setNewUserId] = React.useState("");
  const [newRoleId, setNewRoleId] = React.useState(ROLES[2].id);

  React.useEffect(() => {
    // client-side protection (only ADMIN)
    try {
      const { getCurrentUser } = require("../lib/auth");
      const cu = getCurrentUser();
      if (!cu || cu.role !== "ADMIN") {
        toast({
          title: "Accès refusé",
          description: "Vous n'êtes pas autorisé à accéder à cette page",
        });
        navigate("/");
        return;
      }
    } catch (e) {}
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const u = await builder.fetchUserExtended();
      setItems(u);
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs étendus",
      });
    } finally {
      setLoading(false);
    }
  }

  async function save(item: UserExtended) {
    try {
      await builder.upsertUserExtended({
        id: item.id,
        userId: item.userId,
        roleId: item.roleId,
      });
      toast({ title: "Succès", description: "Rôle mis à jour" });
      await load();
    } catch (e: any) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour" });
    }
  }

  async function create() {
    if (!newUserId)
      return toast({ title: "Validation", description: "Entrez un userId" });
    try {
      await builder.upsertUserExtended({
        userId: newUserId,
        roleId: newRoleId,
      });
      setNewUserId("");
      setNewRoleId(ROLES[2].id);
      toast({ title: "Succès", description: "Utilisateur ajouté" });
      await load();
    } catch (e: any) {
      toast({ title: "Erreur", description: "Impossible de créer l'entrée" });
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Gestion des utilisateurs & rôles
          </h1>
          <div className="text-sm text-muted">
            Attribuez des rôles aux utilisateurs afin de contrôler l'accès.
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-2">
          Ajouter un mapping utilisateur ↔ rôle
        </h3>
        <div className="flex gap-2 items-center">
          <input
            className="input"
            placeholder="userId (ex: u_123)"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
          />
          <select
            className="input"
            value={newRoleId}
            onChange={(e) => setNewRoleId(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <button className="btn" onClick={create}>
            Ajouter
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-3">Mappings existants</h3>
        {loading ? (
          <div>Chargement...</div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3 border rounded flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.userId}</div>
                  <div className="text-sm text-muted">
                    id interne: {item.id}
                  </div>
                </div>
                <div>
                  <select
                    className="input"
                    value={item.roleId}
                    onChange={(e) => {
                      item.roleId = e.target.value;
                      setItems(
                        items.map((it) =>
                          it.id === item.id
                            ? { ...it, roleId: e.target.value }
                            : it,
                        ),
                      );
                    }}
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button className="btn" onClick={() => save(item)}>
                    Enregistrer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
