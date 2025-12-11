import React, { useEffect, useState } from "react";
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
  async function load(){ const r = await builder.fetchRules(); setRules(r); }

  async function create(){
    const r: Partial<RuleEngineRule> = { resource, action, condition: condition || undefined, onlyRoles: onlyRoles? onlyRoles.split(',').map(s=>s.trim()): undefined, active: true };
    await builder.createRule(r);
    setResource(''); setAction(''); setCondition(''); setOnlyRoles('');
    await load();
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
          <input className="input" placeholder='Condition JSON (ex: {"field":"risk.level","operator":"==","value":"CRITIQUE"})' value={condition} onChange={(e)=>setCondition(e.target.value)} />
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
            <div key={r.id} className="p-2 border rounded">
              <div className="font-medium">{r.resource} • {r.action} {r.onlyRoles? `• Roles: ${r.onlyRoles.join(',')}`:''}</div>
              <div className="text-sm text-muted">{r.description}</div>
              <div className="text-xs mt-2">Condition: <pre className="inline">{r.condition}</pre></div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
