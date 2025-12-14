import React from "react";

export default function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-muted/40 rounded w-full" />
      ))}
    </div>
  );
}
