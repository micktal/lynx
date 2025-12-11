import React from 'react';
import Layout from '../components/Layout';
import CardPro from '../components/ui/CardPro';
import KpiBlock from '../components/ui/KpiBlock';

export default function HomePage(){
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bienvenue sur la plateforme Lynx Audit Pro</h1>
        <p className="text-muted">Votre centre de supervision et d'analytique de sécurité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CardPro title="Faire un audit"><div>Créer et planifier un audit rapidement</div></CardPro>
        <CardPro title="Voir les risques"><div>Consulter les risques critiques</div></CardPro>
        <CardPro title="Reporting"><div>Ouvrir les dashboards analytiques</div></CardPro>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiBlock title="Sites total" value={12} />
        <KpiBlock title="Risques critiques" value={3} color="#E02424" />
        <KpiBlock title="Actions ouvertes" value={8} color="#FFB020" />
      </div>

    </Layout>
  );
}
