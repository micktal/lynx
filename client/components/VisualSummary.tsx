import React from "react";

export default function VisualSummary({pieData, barData}: {pieData: {label:string,value:number}[], barData:{label:string,critical:number,important:number,medium:number,low:number}[]}){
  // Simple pie approximation and bars
  const total = pieData.reduce((s,d)=>s+d.value,0) || 1;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card">
        <h4 className="font-semibold mb-2">Répartition états équipements</h4>
        <div className="flex items-center gap-4">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {pieData.reduce((acc,(d,i)=>{
              const start = acc.angle;
              const angle = (d.value/total)*Math.PI*2;
              const end = start+angle;
              const large = angle>Math.PI?1:0;
              const x1 = 60+50*Math.cos(start);
              const y1 = 60+50*Math.sin(start);
              const x2 = 60+50*Math.cos(end);
              const y2 = 60+50*Math.sin(end);
              const path = `M60 60 L ${x1} ${y1} A 50 50 0 ${large} 1 ${x2} ${y2} Z`;
              acc.paths.push({path, color: ["#16a34a","#f59e0b","#ef4444","#f97316","#9ca3af"][i % 5]});
              acc.angle=end;
              return acc;
            },{angle:-Math.PI/2,paths:[] as any[]}).paths.map((p,i)=>(<path key={i} d={p.path} fill={p.color}></path>))}
          </svg>
          <div>
            {pieData.map((d)=> (
              <div key={d.label} className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded" style={{background: d.label.includes('OK')? '#16a34a': d.label.includes('Non')? '#ef4444': d.label.includes('À')? '#f59e0b':'#9ca3af'}}></span>{d.label} — {d.value}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="card md:col-span-2">
        <h4 className="font-semibold mb-2">Risques par bâtiment</h4>
        <div className="space-y-2">
          {barData.map((b)=>(
            <div key={b.label}>
              <div className="flex items-center justify-between text-sm mb-1"><div>{b.label}</div><div className="text-muted">Crit: {b.critical}</div></div>
              <div className="h-4 bg-muted/30 rounded overflow-hidden">
                <div style={{width: `${b.critical*8}px`}} className="h-4 bg-red-500 inline-block"></div>
                <div style={{width: `${b.important*8}px`}} className="h-4 bg-orange-400 inline-block"></div>
                <div style={{width: `${b.medium*8}px`}} className="h-4 bg-yellow-300 inline-block"></div>
                <div style={{width: `${b.low*8}px`}} className="h-4 bg-green-300 inline-block"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}