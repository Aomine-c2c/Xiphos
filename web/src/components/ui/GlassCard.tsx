import React from "react";

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowHover?: "cyan" | "purple" | "emerald" | "crimson" | "gold" | "white";
}

export const GlassCard = ({ children, className = "", glowHover }: GlassCardProps) => {
  const hoverClass = glowHover ? `hover:border-xiphos-${glowHover}/30 hover:bg-white/5` : "hover:bg-white/5";
  return (
    <div className={`glass-card transition-all duration-300 ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};
