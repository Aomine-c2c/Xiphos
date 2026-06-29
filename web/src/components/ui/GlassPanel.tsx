import React from "react";

export interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "emerald" | "crimson" | "gold" | "white";
  glowOpacity?: number; // 0 to 100
  noOverflowHidden?: boolean;
}

export const GlassPanel = ({ 
  children, 
  className = "", 
  glowColor,
  glowOpacity = 5,
  noOverflowHidden = false
}: GlassPanelProps) => {
  const glowClass = glowColor === "white" ? "bg-white" : `bg-xiphos-${glowColor}`;
  const overflowClass = noOverflowHidden ? "" : "overflow-hidden";
  
  return (
    <div className={`glass-panel flex flex-col flex-1 min-h-0 relative ${overflowClass} ${className}`}>
      {glowColor && (
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${glowClass} opacity-${glowOpacity} blur-[120px] rounded-full pointer-events-none z-0`}></div>
      )}
      {children}
    </div>
  );
};
