import React, { useEffect, useState } from "react";
import type { Site } from "@shared/api";

export default function SiteForm({
  initial,
  open,
  onClose,
  onSave,
}: {
  initial?: Site | null;
  open: boolean;
  onClose: () => void;
  onSave: (payload: Partial<Site>) => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setAddress(initial.address || "");
      setCity(initial.city || "");
      setCountry(initial.country || "");
      setContactName(initial.contactName || "");
      setContactEmail(initial.contactEmail || "");
    } else {
      setName("");
      setAddress("");
      setCity("");
      setCountry("");
      setContactName("");
      setContactEmail("");
    }
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-card border border-border rounded-md p-6 z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold">{initial ? "Modifier le site" : "Créer un site"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du site" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Pays" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email contact" className="px-3 py-2 rounded-md border border-border bg-input" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-md border border-border text-sm">
            Annuler
          </button>
          <button
            onClick={() => {
              onSave({ name, address, city, country, contactName, contactEmail });
            }}
            className="brand-btn"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
