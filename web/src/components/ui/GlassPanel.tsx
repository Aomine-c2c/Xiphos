import React from "react";

export interface GlassPanelProps {
 children: React.ReactNode;
 className?: string;
 glowColor?: "cyan" | "purple" | "emerald" | "crimson" | "gold" | "white"; // Kept for API compatibility, but unused
 glowOpacity?: number; 
 noOverflowHidden?: boolean;
}

export const GlassPanel = ({ 
 children, 
 className = "", 
 noOverflowHidden = false
}: GlassPanelProps) => {
 const overflowClass = noOverflowHidden ? "" : "overflow-hidden";
 
 return (
 <div className={`bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg flex flex-col flex-1 min-h-0 relative ${overflowClass} ${className}`}>
 {children}
 </div>
 );
};
