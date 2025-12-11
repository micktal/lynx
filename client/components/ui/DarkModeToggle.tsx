import React, { useEffect, useState } from 'react';

export default function DarkModeToggle(){
  const [dark, setDark] = useState<boolean>(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  useEffect(()=>{
    if(dark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
  },[dark]);

  return (
    <button className="btn" onClick={()=>setDark(d=>!d)} aria-label="Toggle dark mode">
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
