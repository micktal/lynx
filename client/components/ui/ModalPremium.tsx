import React from 'react';

export default function ModalPremium({ open, onClose, children }: { open: boolean; onClose: ()=>void; children: React.ReactNode }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="modal-premium z-10 max-w-2xl w-full">
        <div className="flex justify-end"><button className="btn-ghost" onClick={onClose}>✕</button></div>
        <div>{children}</div>
      </div>
    </div>
  );
}
