import React, { useEffect, useRef, useState } from "react";
import { uploadAttachment } from "../lib/attachmentsService";
import { toast } from "@/hooks/use-toast";
import * as builder from "../lib/builderService";
import * as projectService from "../lib/projectService";

type EntityType =
  | "site"
  | "audit"
  | "risk"
  | "equipment"
  | "project"
  | "chantier"
  | "action";

interface PhotoUploaderProps {
  entityType?: EntityType; // optional default
  entityId?: number | string;
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

  // target selection state
  const [targetType, setTargetType] = useState<EntityType>(
    entityType || "audit",
  );
  const [targetId, setTargetId] = useState<string | number | null>(
    entityId != null ? String(entityId) : null,
  );
  const [options, setOptions] = useState<
    Array<{ id: string | number; label: string }>
  >([]);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");

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
    if (!targetId)
      return setError("Sélectionnez une entité cible avant l'upload");

    try {
      setUploading(true);
      setProgress(5);

      // Upload via Netlify function which handles storage + DB insert
      const attachment = await uploadAttachment(
        file,
        targetType,
        targetId,
        (p) => setProgress(p),
      );

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

  async function loadOptions(type: EntityType) {
    try {
      let list: Array<any> = [];
      switch (type) {
        case "equipment":
          list = await builder.fetchEquipments();
          setOptions(
            list.map((i: any) => ({
              id: i.id,
              label: `${i.name} (${i.reference || i.id})`,
            })),
          );
          break;
        case "site":
          list = await builder.fetchSites();
          setOptions(list.map((i: any) => ({ id: i.id, label: i.name })));
          break;
        case "project":
          list = await projectService.fetchProjects();
          setOptions(list.map((i: any) => ({ id: i.id, label: i.name })));
          break;
        case "chantier":
          list = await projectService.fetchChantiers();
          setOptions(list.map((i: any) => ({ id: i.id, label: i.name })));
          break;
        case "action":
          list = await builder.fetchActions();
          setOptions(
            list.map((i: any) => ({ id: i.id, label: i.title || i.id })),
          );
          break;
        case "risk":
          list = await builder.fetchRisks();
          setOptions(
            list.map((i: any) => ({ id: i.id, label: i.title || i.id })),
          );
          break;
        case "audit":
          list = await builder.fetchAudits();
          setOptions(
            list.map((i: any) => ({ id: i.id, label: i.title || i.id })),
          );
          break;
        default:
          setOptions([]);
      }
    } catch (e) {
      console.error("Failed to load options for", type, e);
      setOptions([]);
    }
  }

  useEffect(() => {
    loadOptions(targetType);
  }, [targetType]);

  return (
    <div className="card p-4 space-y-3">
      {/* Target selection */}
      <div className="flex gap-2 items-start">
        <div className="w-48">
          <label className="text-xs">Associer la photo à</label>
          <select
            className="input w-full"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as EntityType)}
          >
            <option value="audit">Audit</option>
            <option value="equipment">Équipement</option>
            <option value="site">Site</option>
            <option value="project">Projet</option>
            <option value="chantier">Chantier</option>
            <option value="action">Action</option>
            <option value="risk">Risque</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="text-xs">Sélectionnez une entité (ou créez)</label>
          <div className="flex gap-2 mt-1">
            <select
              className="input flex-1"
              value={targetId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__create__") {
                  setCreatingNew(true);
                } else {
                  setTargetId(v || null);
                }
              }}
            >
              <option value="">-- Choisir --</option>
              {options.map((o) => (
                <option key={String(o.id)} value={String(o.id)}>
                  {o.label}
                </option>
              ))}
              <option value="__create__">+ Créer...</option>
            </select>

            <button
              className="btn-sm"
              onClick={() => setCreatingNew(true)}
              type="button"
            >
              +
            </button>
          </div>

          {creatingNew && (
            <div className="mt-2 flex gap-2">
              <input
                className="input flex-1"
                placeholder="Nom de la nouvelle entité"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                className="btn"
                onClick={async () => {
                  if (!newName.trim())
                    return toast({
                      title: "Validation",
                      description: "Nom requis",
                    });
                  try {
                    let created: any = null;
                    if (targetType === "project") {
                      created = await projectService.createProject({
                        name: newName.trim(),
                      } as any);
                    } else if (targetType === "chantier") {
                      created = await projectService.createChantier({
                        name: newName.trim(),
                      } as any);
                    } else if (targetType === "equipment") {
                      created = await builder.createEquipment({
                        name: newName.trim(),
                      } as any);
                    } else if (targetType === "site") {
                      created = await builder.createSite({
                        name: newName.trim(),
                      } as any);
                    } else if (targetType === "action") {
                      created = await builder.createAction({
                        title: newName.trim(),
                      } as any);
                    } else if (targetType === "risk") {
                      created = await builder.createRisk({
                        title: newName.trim(),
                      } as any);
                    } else if (targetType === "audit") {
                      // audits require more fields; create a minimal one
                      created = await builder.createAudit({
                        title: newName.trim(),
                        siteId: null,
                      } as any);
                    }
                    if (created) {
                      await loadOptions(targetType);
                      setTargetId(created.id || created);
                      setNewName("");
                      setCreatingNew(false);
                      toast({ title: "Succès", description: "Entité créée" });
                    }
                  } catch (e: any) {
                    console.error(e);
                    toast({ title: "Erreur", description: "Création échouée" });
                  }
                }}
              >
                Créer
              </button>
            </div>
          )}
        </div>
      </div>

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
            <div
              className="text-sm mt-2"
              style={{ color: "var(--text)", fontWeight: 600 }}
            >
              Glissez-déposez une photo ici
              <br />
              ou cliquez pour sélectionner
            </div>
          </>
        )}

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="max-h-48 rounded-lg shadow"
          />
        )}
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      {uploading && (
        <div className="w-full bg-muted/40 rounded h-2 overflow-hidden">
          <div
            className="h-2 bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div
          className="text-xs"
          style={{ color: "var(--text)", fontWeight: 600 }}
        >
          {file ? file.name : "Aucun fichier sélectionné"}
        </div>

        <div className="flex gap-2">
          <button
            className="btn-ghost"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Ajouter depuis appareil
          </button>

          {file && !uploading && (
            <button className="btn-ghost" onClick={reset}>
              Annuler
            </button>
          )}

          <button
            className="btn"
            disabled={!file || uploading}
            onClick={async () => {
              try {
                await handleUpload();
                toast({ title: "Succès", description: "Photo uploadée" });
              } catch (e: any) {
                toast({
                  title: "Erreur",
                  description: e?.message || "Upload échoué",
                });
              }
            }}
          >
            {uploading ? "Upload..." : "Uploader"}
          </button>
        </div>
      </div>
    </div>
  );
}
