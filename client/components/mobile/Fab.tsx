import React from "react";

export default function Fab({ onClick, label }: { onClick: ()=>void; label?: string }) {
  return (
    <button onClick={onClick} className="fixed right-4 bottom-20 bg-primary text-white rounded-full p-4 shadow-lg" style={{ zIndex: 70 }}>
      <div className="text-lg font-bold">+</div>
      {label && <div className="text-xs">{label}</div>}
    </button>
  );
}
