import React, { useEffect, useState } from "react";
import * as builder from "../lib/builderService";

export default function AttachmentsGallery({ entityType, entityId }:{ entityType:string, entityId:string|number }){
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any|null>(null);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const a = await builder.fetchAttachmentsForEntity(entityType, entityId);
        if(mounted) setAttachments(a || []);
      }catch(e){ console.error(e); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false; };
  },[entityType, entityId]);

  useEffect(()=>{
    // preload signed urls for visible attachments
    const controller = new AbortController();
    (async ()=>{
      const map: Record<string,string> = {};
      for(const att of attachments){
        if(!att.id) continue;
        try{
          const r = await fetch(`/api/attachments/${att.id}/url`, { signal: controller.signal });
          if(!r.ok) continue;
          const j = await r.json();
          map[att.id] = j.url;
        }catch(e){ /* ignore */ }
      }
      setSignedUrls(map);
    })();
    return ()=>controller.abort();
  },[attachments]);

  if(loading) return <div className="text-sm text-muted">Chargement photos...</div>;
  if(attachments.length===0) return <div className="text-sm text-muted">Aucune photo</div>;

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {attachments.map((att)=> (
          <button key={att.id || att.file_url} onClick={()=>setSelected(att)} className="rounded overflow-hidden">
            <img src={signedUrls[att.id] || '/placeholder.svg'} alt={att.file_name || att.fileName || ''} className="w-full h-24 object-cover" />
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setSelected(null)} />
          <div className="z-70 max-w-3xl p-4">
            <img src={signedUrls[selected.id] || selected.file_url || selected.fileUrl || selected.publicUrl} alt={selected.file_name || ''} className="rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
