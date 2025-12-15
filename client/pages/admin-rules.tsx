import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { RuleEngineRule } from "@shared/api";

export default function AdminRulesPage(){
  const [rules, setRules] = useState<RuleEngineRule[]>([]);
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [condition, setCondition] = useState('');
  const [onlyRoles, setOnlyRoles] = useState('');

  useEffect(()=>{ load(); },[]);
  async function load(){
    try {
      const r = await builder.fetchRules();
      setRules(r);
    } catch (e:any) {
      toast({ title: 'Erreur', description: 'Impossible de charger les règles' });
    }
  }

  async function create(){
    // validate
    if (!resource || !action) {
      toast({ title: 'Validation', description: 'Resource et Action sont requis' });
      return;
    }
    let parsedCondition: any = null;
    try {
      parsedCondition = condition ? JSON.parse(condition) : {};
    } catch (e:any) {
      toast({ title: 'JSON invalide', description: 'La condition JSON est invalide' });
      return;
    }

    try {
      const r: Partial<RuleEngineRule> = { resource, action, condition: parsedCondition, onlyRoles: onlyRoles? onlyRoles.split(',').map(s=>s.trim()): undefined, active: true };
      await builder.createRule(r);
      setResource(''); setAction(''); setCondition(''); setOnlyRoles('');
      await load();
      toast({ title: 'Succès', description: 'Règle créée' });
    } catch (e:any) {
      console.error('create rule failed', e);
      toast({ title: 'Erreur', description: 'Impossible de créer la règle' });
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Moteur de règles</h1>
          <div className="text-sm text-muted">Règles conditionnelles et contrôles d'accès avancés</div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" placeholder="Resource (ex: action)" value={resource} onChange={(e)=>setResource(e.target.value)} />
          <input className="input" placeholder="Action (ex: UPDATE)" value={action} onChange={(e)=>setAction(e.target.value)} />
          <textarea rows={2} className="input font-mono text-sm" placeholder='Condition JSON (ex: {"field":"risk.level","operator":"==","value":"CRITIQUE"})' value={condition} onChange={(e)=>setCondition(e.target.value)} />
          <input className="input" placeholder="onlyRoles (comma)" value={onlyRoles} onChange={(e)=>setOnlyRoles(e.target.value)} />
        </div>
        <div className="mt-3">
          <button className="btn" onClick={create}>Créer la règle</button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-3">Règles existantes</h3>
        <div className="space-y-2">
          {rules.map(r=> (
            <div key={r.id} className="p-3 border rounded bg-card-2">
              <div className="font-medium break-words">{r.resource} • {r.action} {r.onlyRoles? `• Roles: ${r.onlyRoles.join(',')}`:''}</div>
              {r.description ? <div className="text-sm text-muted mt-1">{r.description}</div> : null}
              {r.condition ? (
                <div className="mt-2">
                  <div className="text-xs text-muted mb-1">Condition:</div>
                  <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">{r.condition}</pre>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
