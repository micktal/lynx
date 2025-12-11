import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { AuditTemplate, AuditCategory, AuditSubcategory, AuditQuestion } from "@shared/api";

export default function ReferentielsPreview() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<AuditTemplate | null>(null);
  const [categories, setCategories] = useState<AuditCategory[]>([]);
  const [subcatsMap, setSubcatsMap] = useState<Record<string, any[]>>({});
  const [questionsMap, setQuestionsMap] = useState<Record<string, any[]>>({});

  useEffect(()=>{
    (async ()=>{
      if (!templateId) return;
      const pls = await builder.fetchAuditTemplates();
      const t = pls.find(p=>p.id===templateId) || null;
      setTemplate(t);
      const cats = await builder.fetchCategoriesForTemplate(templateId);
      setCategories(cats);
      const scm: Record<string, any[]> = {};
      const qsm: Record<string, any[]> = {};
      for (const c of cats) {
        const sc = await builder.fetchSubcategoriesForCategory(c.id);
        scm[c.id] = sc;
        for (const s of sc) {
          const qs = await builder.fetchQuestionsForSubcategory(s.id);
          qsm[s.id] = qs;
        }
      }
      setSubcatsMap(scm);
      setQuestionsMap(qsm);
    })();
  },[templateId]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Aperçu template {template?.name}</h1>
      </div>

      {categories.map((c)=> (
        <div key={c.id} className="card mb-4 p-4">
          <h3 className="font-semibold">{c.name}</h3>
          <div className="mt-2">
            {(subcatsMap[c.id]||[]).map((s:any)=> (
              <div key={s.id} className="mb-2">
                <div className="font-medium">{s.name}</div>
                <ul className="list-disc ml-5 mt-1">
                  {(questionsMap[s.id]||[]).map((q:any)=>(<li key={q.id} className="text-sm">{q.label} {q.critical? <span className="text-red-600">(Critique)</span> : null}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}

    </Layout>
  );
}
