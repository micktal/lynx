import React, { useEffect, useRef, useState } from "react";
import type { BuildingPlan, PlanArea, PlanMarker } from "@shared/api";

function parseShapeData(shapeData?: string) {
  try {
    return shapeData ? JSON.parse(shapeData) : null;
  } catch (e) {
    return null;
  }
}

export default function BuildingPlanInteractive({
  buildingPlan,
  planAreas = [],
  planMarkers = [],
  showAreas = true,
  showMarkers = true,
  onMarkerClick,
  onAreaClick,
}: {
  buildingPlan: BuildingPlan;
  planAreas?: PlanArea[];
  planMarkers?: PlanMarker[];
  showAreas?: boolean;
  showMarkers?: boolean;
  onMarkerClick?: (m: PlanMarker) => void;
  onAreaClick?: (a: PlanArea) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY / 500;
      setScale((s) => Math.min(3, Math.max(0.25, +(s + delta).toFixed(2))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMouseDown = (e: MouseEvent) => {
      setDragging(true);
      dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging || !dragStart.current) return;
      setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const onMouseUp = () => {
      setDragging(false);
      dragStart.current = null;
    };
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, offset.x, offset.y]);

  // parse viewBox from svgContent
  const viewBox = (() => {
    try {
      const doc = new DOMParser().parseFromString(buildingPlan.svgContent || "", "image/svg+xml");
      const svg = doc.querySelector("svg");
      if (!svg) return { x: 0, y: 0, w: buildingPlan.width || 800, h: buildingPlan.height || 600 };
      const vb = svg.getAttribute("viewBox");
      if (vb) {
        const parts = vb.split(/\s+|,/).map(Number);
        return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
      }
      const w = Number(svg.getAttribute("width")) || buildingPlan.width || 800;
      const h = Number(svg.getAttribute("height")) || buildingPlan.height || 600;
      return { x: 0, y: 0, w, h };
    } catch (e) {
      return { x: 0, y: 0, w: buildingPlan.width || 800, h: buildingPlan.height || 600 };
    }
  })();

  function localToScreen(x: number, y: number) {
    // map svg coords to container coords with scale and offset
    const sx = (x - viewBox.x) * scale + offset.x;
    const sy = (y - viewBox.y) * scale + offset.y;
    return { x: sx, y: sy };
  }

  return (
    <div className="card p-4">
      <div className="flex gap-2 mb-3">
        <button className="btn" onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))}>Zoom +</button>
        <button className="btn" onClick={() => setScale((s) => Math.max(0.25, +(s - 0.2).toFixed(2)))}>Zoom -</button>
        <button className="btn" onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}>Reset</button>
      </div>

      <div ref={containerRef} className="relative overflow-hidden" style={{ width: "100%", height: 560, cursor: dragging ? "grabbing" : "grab" }}>
        <div style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: "0 0" }}>
          <div dangerouslySetInnerHTML={{ __html: buildingPlan.svgContent }} />

          {/* overlay areas as svg on top */}
          {showAreas && (
            <svg ref={svgRef} width={viewBox.w} height={viewBox.h} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
              {planAreas.map((a) => {
                const sd = parseShapeData(a.shapeData) || [];
                if (a.shapeType === "polygon") {
                  const points = sd.map((p: any) => `${p.x},${p.y}`).join(" ");
                  return (
                    <polygon key={a.id} points={points} fill={a.fillColor || "#dbeafe"} stroke={a.strokeColor || "#60a5fa"} opacity={a.opacity ?? 0.5} onClick={() => onAreaClick && onAreaClick(a)} onMouseEnter={() => {}} style={{ pointerEvents: "auto" }} />
                  );
                }
                if (a.shapeType === "rect") {
                  const obj = sd as any;
                  return <rect key={a.id} x={obj.x} y={obj.y} width={obj.width} height={obj.height} fill={a.fillColor} stroke={a.strokeColor} opacity={a.opacity ?? 0.5} onClick={() => onAreaClick && onAreaClick(a)} style={{ pointerEvents: "auto" }} />;
                }
                if (a.shapeType === "circle") {
                  const obj = sd as any;
                  return <circle key={a.id} cx={obj.cx} cy={obj.cy} r={obj.r} fill={a.fillColor} stroke={a.strokeColor} opacity={a.opacity ?? 0.5} onClick={() => onAreaClick && onAreaClick(a)} style={{ pointerEvents: "auto" }} />;
                }
                return null;
              })}
            </svg>
          )}

          {/* markers overlay using absolute positioned elements */}
          {showMarkers && (
            <div style={{ position: "absolute", left: 0, top: 0, width: viewBox.w, height: viewBox.h, pointerEvents: "none" }}>
              {planMarkers.map((m) => {
                const pos = localToScreen(m.x, m.y);
                const size = 22;
                const style: React.CSSProperties = { position: "absolute", left: pos.x - size / 2, top: pos.y - size / 2, width: size, height: size, transform: `translate(0,0)`, pointerEvents: "auto", cursor: "pointer" };
                const bg = m.color || (m.type === "risk" ? "#f43f5e" : "#10b981");
                return (
                  <div key={m.id} style={style} title={m.tooltip} onClick={() => onMarkerClick && onMarkerClick(m)}>
                    <div style={{ width: size, height: size, borderRadius: 6, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>{m.iconType ? m.iconType.charAt(0).toUpperCase() : m.type === "risk" ? "!" : "E"}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
