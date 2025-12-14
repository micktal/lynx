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
      const result = await uploadPhoto(file, siteId);
      const publicUrl = result.publicUrl || (result as any);
      // If server created attachment record, it will be returned
      if (result.attachment) {
        onUploaded?.(result.attachment);
      } else {
        // fallback: try to persist via builder service (mock)
        try {
          const created = await builder.createAttachment({ fileUrl: publicUrl, fileType: file.type, siteId: siteId, fileName: file.name } as any);
          onUploaded?.(created);
        } catch (e) {
          console.warn('Failed to save attachment record via builder service', e);
          onUploaded?.({ file_url: publicUrl });
        }
      }
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
