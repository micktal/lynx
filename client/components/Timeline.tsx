import React from "react";
import type { ActivityLog } from "@shared/api";

const ICONS: Record<string, string> = {
  created: "🆕",
  updated: "✏️",
  statusChanged: "🔄",
  deleted: "🗑️",
  commentAdded: "💬",
  photoAdded: "📸",
};

const COLORS: Record<string, string> = {
  created: "bg-green-500",
  updated: "bg-blue-500",
  statusChanged: "bg-orange-400",
  deleted: "bg-red-600",
  commentAdded: "bg-violet-500",
  photoAdded: "bg-cyan-400",
};

export default function Timeline({ items }: { items: ActivityLog[] }) {
  if (!items || items.length === 0) return <div className="card text-center py-6">Aucun événement enregistré.</div>;

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted/40" />
      <ul className="space-y-6 pl-10">
        {items.map((it) => (
          <li key={it.id} className="relative">
            <div className="absolute -left-7 top-0 w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: undefined }}>
              <span className={`${COLORS[it.operation] || 'bg-gray-400'} inline-flex items-center justify-center w-10 h-10 rounded-full`}>{ICONS[it.operation] || '•'}</span>
            </div>
            <div>
              <div className="text-sm text-muted">{new Date(it.timestamp).toLocaleString()}</div>
              <div className="mt-1">
                <div className="font-medium">{it.description}</div>
                {it.userId && <div className="text-sm text-muted">Par: {it.userId}</div>}
                {it.metadata && <div className="text-sm text-muted mt-1">{typeof it.metadata === 'string' ? it.metadata : JSON.stringify(it.metadata)}</div>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
