import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import projectService from '../lib/projectService';
import { Link } from 'react-router-dom';

export default function ChantiersPage(){
  const [chantiers, setChantiers] = useState<any[]>([]);

  useEffect(()=>{
    (async ()=>{
      const ch = await projectService.fetchChantiers();
      setChantiers(ch || []);
    })();
  },[]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Chantiers</h1>
          <div className="text-sm text-muted">Liste des chantiers</div>
        </div>
        <div>
          <Link to="/chantier/new" className="btn btn-premium">Créer chantier</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chantiers.map(c=> (
          <div key={c.id} className="card">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <div className="text-sm text-muted">{c.companyAssigned}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{c.progression || 0}%</div>
                <div className="text-sm"><Link to={`/chantier/${c.id}`}>Ouvrir</Link></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
