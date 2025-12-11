import React from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

export default function UnauthorizedPage(){
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl">❌</div>
        <h1 className="text-2xl font-bold mt-4">Vous n’avez pas les permissions nécessaires</h1>
        <p className="text-muted mt-2">Contactez un administrateur si vous pensez que c’est une erreur.</p>
        <div className="mt-6">
          <Link to="/dashboard" className="btn">Retour au dashboard</Link>
        </div>
      </div>
    </Layout>
  );
}
