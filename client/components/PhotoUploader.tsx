import React, { useRef, useState } from "react";
import { uploadAttachment } from "../lib/attachmentsService";

type EntityType = "site" | "audit" | "risk" | "equipment";

interface PhotoUploaderProps {
  entityType: EntityType;
  entityId: number;
  onUploaded?: (attachment: any) => void;
  maxSizeMb?: number;
}

export default function PhotoUploader({
  entityType,
  entityId,
  onUploaded,
  maxSizeMb = 10,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setProgress(0);
    setError(null);
  }

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) {
      setError("Format non supporté (image uniquement)");
      return;
    }

    if (f.size > maxSizeMb * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxSizeMb} MB)`);
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function handleUpload() {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(5);

      // Upload via Netlify function which handles storage + DB insert
      const attachment = await uploadAttachment(file, entityType, entityId, (p) => setProgress(p));

      setProgress(100);

      onUploaded?.(attachment);
      reset();
    } catch (e: any) {
      console.error(e);
      setError("Erreur lors de l’upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition
          ${dragOver ? "border-primary bg-primary/5" : "border-border"}
        `}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />

        {!preview && (
          <>
            <div className="text-3xl">📷</div>
            <div className="text-sm mt-2" style={{ color: 'var(--text)', fontWeight: 600 }}>
              Glissez-déposez une photo ici
              <br />
              ou cliquez pour sélectionner
            </div>
          </>
        )}

        {preview && (
          <img src={preview} alt="preview" className="max-h-48 rounded-lg shadow" />
        )}
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      {uploading && (
        <div className="w-full bg-muted/40 rounded h-2 overflow-hidden">
          <div className="h-2 bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs" style={{ color: 'var(--text)', fontWeight: 600 }}>{file ? file.name : "Aucun fichier sélectionné"}</div>

        <div className="flex gap-2">
          {file && !uploading && (
            <button className="btn-ghost" onClick={reset}>
              Annuler
            </button>
          )}

          <button className="btn" disabled={!file || uploading} onClick={handleUpload}>
            {uploading ? "Upload..." : "Uploader"}
          </button>
        </div>
      </div>
    </div>
  );
}
