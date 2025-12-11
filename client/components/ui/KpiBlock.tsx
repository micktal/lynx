import React, { useEffect, useState } from 'react';

export default function KpiBlock({ title, value, color }: { title: string; value: number; color?: string }){
  const [count, setCount] = useState(0);
  useEffect(()=>{
    let start = 0; const end = value; const dur = 700; const step = Math.max(1, Math.round(end/20));
    const t = setInterval(()=>{ start += step; if(start>=end){ setCount(end); clearInterval(t);} else setCount(start); }, dur/20);
    return ()=> clearInterval(t);
  },[value]);

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold`} style={{background: color || 'var(--primary)'}}>{/* icon placeholder */}★</div>
      <div>
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-sm text-muted">{title}</div>
      </div>
    </div>
  );
}
