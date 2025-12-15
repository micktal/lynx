import React, { useEffect, useState } from "react";
import * as builder from "../lib/builderService";
import { toast } from "@/hooks/use-toast";

export default function AttachmentsGallery({ entityType, entityId }:{ entityType:string, entityId:string|number }){
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any|null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string,string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if(!confirm('Supprimer cette photo ?')) return;
    try{
      setDeletingId(id);
      await builder.deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
      setSignedUrls((s) => { const c = { ...s }; delete c[id]; return c; });
      if(selected && selected.id === id) setSelected(null);
    }catch(e){
      console.error('Failed to delete attachment', e);
      alert('Impossible de supprimer la photo');
    }finally{
      setDeletingId(null);
    }
  };

  if(loading) return <div className="text-sm" style={{ color: 'var(--text)', fontWeight: 600 }}>Chargement photos...</div>;
  if(attachments.length===0) return <div className="text-sm" style={{ color: 'var(--text)', fontWeight: 600 }}>Aucune photo</div>;

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {attachments.map((att)=> (
          <div key={att.id || att.file_url} className="relative rounded overflow-hidden">
            <button onClick={()=>setSelected(att)} className="block w-full">
              <img src={signedUrls[att.id] || att.file_url || att.fileUrl || '/placeholder.svg'} alt={att.file_name || att.fileName || ''} className="w-full h-24 object-cover" />
            </button>
            <button onClick={()=>handleDelete(att.id)} disabled={deletingId===att.id} className="absolute top-1 right-1 bg-white rounded p-1 text-sm">{deletingId===att.id ? '...' : '🗑️'}</button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setSelected(null)} />
          <div className="z-70 max-w-3xl p-4">
            <img src={signedUrls[selected.id] || selected.file_url || selected.fileUrl || selected.publicUrl} alt={selected.file_name || ''} className="rounded max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
