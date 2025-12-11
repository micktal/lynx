import React from 'react';

export default function CardPro({ children, title, clickable }: { children: React.ReactNode; title?: string; clickable?: boolean }){
  return (
    <div className={`card ${clickable? 'card-clickable' : ''}`}>
      {title && <div className="mb-3 font-semibold">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
