import { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { RuleEngineRule } from "@shared/api";

const RESOURCES = ['action','risk','site','building','space','equipment','user'];
const ACTIONS = ['CREATE','READ','UPDATE','DELETE'];
const ROLES = ['ADMIN','MANAGER','AUDITEUR','USER'];

export default function AdminRulesPage(){
  const [rules, setRules] = useState<RuleEngineRule[]>([]);
  const [resource, setResource] = useState('action');
  const [action, setAction] = useState('UPDATE');
  const [condition, setCondition] = useState('');
  const [onlyRoles, setOnlyRoles] = useState<string[]>([]);

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
        <h2 className="font-semibold mb-2">Mode d'emploi rapide</h2>
        <p className="text-sm text-muted mb-3">Utilisez ce panneau pour définir des règles conditionnelles qui contrôlent l'autorisation d'opérations sensibles (ex: modification ou suppression d'actions/risques). Créez une règle en indiquant la ressource, l'action, une condition JSON simple et la liste des rôles autorisés.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Mini-lexique</h3>
            <ul className="text-sm mt-2 space-y-2">
              <li><strong>Ressource</strong>: l'entité ciblée par la règle (ex: <code>action</code>, <code>risk</code>).</li>
              <li><strong>Action</strong>: l'opération autorisée ou bloquée (ex: <code>UPDATE</code>, <code>DELETE</code>).</li>
              <li><strong>Condition</strong>: objet JSON évalué sur la ressource (ex: <code>{"field\":\"risk.level\",\"operator\":\"==\",\"value\":\"CRITIQUE"}</code>).</li>
              <li><strong>onlyRoles</strong>: liste de rôles autorisés (ex: <code>MANAGER,ADMIN</code>).</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Qui fait quoi</h3>
            <ul className="text-sm mt-2 space-y-2">
              <li><strong>Front-end</strong>: envoie l'en-tête <code>x-user-role</code> sur les requêtes sensibles ; UI pour créer/éditer/supprimer des règles.</li>
              <li><strong>API serveur</strong>: stocke les règles (table <code>rules</code>) et applique le middleware d'enforcement avant d'exécuter l'opération.</li>
              <li><strong>Enforcement</strong>: vérifie le rôle et évalue la condition JSON ; renvoie <code>403</code> si la règle bloque.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select className="input" value={resource} onChange={(e)=>setResource(e.target.value)}>
            {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select className="input" value={action} onChange={(e)=>setAction(e.target.value)}>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <textarea rows={2} className="input font-mono text-sm" placeholder='Condition JSON (ex: {"field":"risk.level","operator":"==","value":"CRITIQUE"})' value={condition} onChange={(e)=>setCondition(e.target.value)} />

          <select multiple className="input" value={onlyRoles} onChange={(e:any)=>{
            const opts = Array.from(e.target.selectedOptions).map((o: any) => o.value);
            setOnlyRoles(opts);
          }}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
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
                  <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">{typeof r.condition === 'string' ? r.condition : JSON.stringify(r.condition, null, 2)}</pre>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
