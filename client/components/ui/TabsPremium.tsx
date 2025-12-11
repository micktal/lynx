import React from 'react';

export default function TabsPremium<T>({ tabs, active, onChange }: { tabs: { key: T; label: string }[]; active: T; onChange: (k: T)=>void }){
  return (
    <div className="tabs-premium">
      {tabs.map(t=> (
        <div key={String(t.key)} className={`tab ${t.key===active? 'active':''}`} onClick={()=>onChange(t.key)}>{t.label}</div>
      ))}
    </div>
  );
}
