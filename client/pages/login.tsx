import React from 'react';
import Layout from '../components/Layout';

export default function LoginPage(){
  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems:'center', justifyContent:'center', background: 'linear-gradient(180deg,#06203a,#0a84ff)'}}>
      <div className="modal-premium" style={{maxWidth: 420, width: '100%'}}>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold" style={{color: 'white'}}>ROEH</div>
          <div className="text-sm text-white/80">Security Inspection & Risk Intelligence Platform — Connexion</div>
        </div>
        <div>
          <input className="input w-full mb-3" placeholder="Email" />
          <input className="input w-full mb-3" placeholder="Mot de passe" type="password" />
          <button className="btn-premium w-full">Se connecter</button>
        </div>
      </div>
    </div>
  );
}
