import React from "react";

export default function MobileBottomNav({ value, onChange }: { value: string; onChange: (v:string)=>void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2" style={{ zIndex: 60 }}>
      <button className={`flex-1 text-center py-2 ${value==='spaces'?'text-primary':''}`} onClick={()=>onChange('spaces')}>
        <div className="text-xl">🗂️</div>
        <div className="text-xs">Espaces</div>
      </button>
      <button className={`flex-1 text-center py-2 ${value==='equipments'?'text-primary':''}`} onClick={()=>onChange('equipments')}>
        <div className="text-xl">🔧</div>
        <div className="text-xs">Équipements</div>
      </button>
      <button className={`flex-1 text-center py-2 ${value==='risks'?'text-primary':''}`} onClick={()=>onChange('risks')}>
        <div className="text-xl">⚠️</div>
        <div className="text-xs">Risques</div>
      </button>
      <button className={`flex-1 text-center py-2 ${value==='photos'?'text-primary':''}`} onClick={()=>onChange('photos')}>
        <div className="text-xl">📸</div>
        <div className="text-xs">Photos</div>
      </button>
      <button className={`flex-1 text-center py-2 ${value==='sync'?'text-primary':''}`} onClick={()=>onChange('sync')}>
        <div className="text-xl">🔄</div>
        <div className="text-xs">Sync</div>
      </button>
    </div>
  );
}
