import * as builder from "./builderService";

type PendingChange = {
  id: string;
  type: string; // addRisk, addAction, addPhoto, updateEquipment, updateRisk
  payload: any;
  createdAt: string;
};

export function mobileCacheKey(auditId: string) {
  return `mobileCache_${auditId}`;
}
export function pendingChangesKey(auditId: string) {
  return `pendingChanges_${auditId}`;
}

export async function loadCache(auditId: string) {
  const raw = localStorage.getItem(mobileCacheKey(auditId));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

export async function saveCache(auditId: string, data: any) {
  localStorage.setItem(mobileCacheKey(auditId), JSON.stringify(data));
}

export function getPendingChanges(auditId: string): PendingChange[] {
  const raw = localStorage.getItem(pendingChangesKey(auditId));
  if (!raw) return [];
  try { return JSON.parse(raw) as PendingChange[]; } catch (e) { return []; }
}

export function addPendingChange(auditId: string, change: Omit<PendingChange, 'id'|'createdAt'>) {
  const list = getPendingChanges(auditId);
  const entry: PendingChange = { id: `pc_${Date.now()}`, createdAt: new Date().toISOString(), ...change } as PendingChange;
  list.unshift(entry);
  localStorage.setItem(pendingChangesKey(auditId), JSON.stringify(list));
  return entry;
}

export function clearPendingChanges(auditId: string) {
  localStorage.removeItem(pendingChangesKey(auditId));
}

export async function syncPendingChanges(auditId: string, onProgress?: (text: string)=>void) {
  const list = getPendingChanges(auditId);
  const results: { id: string; ok: boolean; error?: any }[] = [];
  for (const ch of list.slice()) {
    try {
      if (onProgress) onProgress(`Sync ${ch.type}`);
      switch (ch.type) {
        case 'addRisk':
          await builder.createRisk(ch.payload);
          break;
        case 'updateRisk':
          await builder.updateRisk(ch.payload.id, ch.payload.patch);
          break;
        case 'addAction':
          await builder.createAction(ch.payload);
          break;
        case 'addPhoto':
          await builder.createAttachment(ch.payload);
          break;
        case 'updateEquipment':
          await builder.updateEquipment(ch.payload.id, ch.payload.patch);
          break;
        default:
          // unknown, skip
          break;
      }
      results.push({ id: ch.id, ok: true });
      // remove from storage
      const remaining = getPendingChanges(auditId).filter((p) => p.id !== ch.id);
      localStorage.setItem(pendingChangesKey(auditId), JSON.stringify(remaining));
    } catch (err) {
      results.push({ id: ch.id, ok: false, error: String(err) });
    }
  }
  return results;
}
