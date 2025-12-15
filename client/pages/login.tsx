import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/auth";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    try {
      setLoading(true);
      const user = await login(email, password);
      toast({
        title: "Succès",
        description: `Connecté en tant que ${user?.role || "user"}`,
      });
      if (user?.role === "ADMIN") navigate("/admin/users");
      else navigate("/projects");
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Connexion échouée",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <div
        className="modal-premium"
        style={{
          maxWidth: 520,
          width: "100%",
          background: "white",
          color: "var(--text)",
        }}
      >
        <div className="text-center mb-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fd93d9a0ec7824aa1ac4d890a1f90a2ec%2F9650ed1450a34dc4bedf5709f6cb160f?format=webp&width=800"
            alt="Logo"
            style={{
              width: 300,
              height: "auto",
              margin: "0 auto 20px",
              display: "block",
            }}
          />
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>
            Security Inspection & Risk Intelligence Platform — Connexion
          </div>
        </div>

        <div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input w-full mb-3"
            placeholder="Email"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full mb-3"
            placeholder="Mot de passe"
            type="password"
          />
          <button
            className="btn-premium w-full"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
