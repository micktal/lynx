import React, { useRef, useState } from "react";
import { uploadPhoto } from "../lib/storageService";
import * as builder from "../lib/builderService";

export default function PhotoUploader({ siteId, onUploaded }:{ siteId:number, onUploaded?: (url:string)=>void }){
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadPhoto(file, siteId);
      // Optionally persist to attachments table via our supabase proxy
      try {
        await builder.createAttachment({ entity_type: 'site', entity_id: siteId, file_url: url, file_name: file.name, file_type: file.type });
      } catch (e) {
        console.warn('Failed to save attachment record via builder service', e);
      }
      onUploaded?.(url);
    } catch (e) {
      console.error('Upload failed', e);
      alert('Échec de l\'upload');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={(e)=>handleFile(e.target.files?.[0] || undefined)} />
      {loading && <div className="text-sm text-muted mt-2">Upload en cours...</div>}
    </div>
  );
}
