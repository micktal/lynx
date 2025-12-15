import React from "react";
export default function LoginPage() {
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
      <div className="modal-premium" style={{ maxWidth: 520, width: "100%", background: 'white', color: 'var(--text)' }}>
        <div className="text-center mb-4">
          <img src="https://cdn.builder.io/api/v1/image/assets%2Fd93d9a0ec7824aa1ac4d890a1f90a2ec%2F9650ed1450a34dc4bedf5709f6cb160f?format=webp&width=800" alt="Logo" style={{ width: 300, height: 'auto', margin: '0 auto 60px', display: 'block' }} />
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Security Inspection & Risk Intelligence Platform — Connexion
          </div>
        </div>
        <div>
          <input className="input w-full mb-3" placeholder="Email" />
          <input
            className="input w-full mb-3"
            placeholder="Mot de passe"
            type="password"
          />
          <button className="btn-premium w-full">Se connecter</button>
        </div>
      </div>
    </div>
  );
}
