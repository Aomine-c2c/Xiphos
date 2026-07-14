import React from "react";

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowHover?: "cyan" | "purple" | "emerald" | "crimson" | "gold" | "white";
  onClick?: () => void;
}

export const GlassCard = ({ children, className = "", glowHover, onClick }: GlassCardProps) => {
  let hoverClass = "hover:border-[#8b5cf6]/35 hover:shadow-[0_8px_30px_rgba(139,92,246,0.08)]"; // Default subtle purple glow hover

  if (glowHover === "cyan") hoverClass = "hover:border-[#8b5cf6]/40 hover:shadow-[0_8px_30px_rgba(139,92,246,0.08)]";
  if (glowHover === "purple") hoverClass = "hover:border-[#8b5cf6]/40 hover:shadow-[0_8px_30px_rgba(139,92,246,0.08)]";
  if (glowHover === "emerald") hoverClass = "hover:border-[#4ade80]/40 hover:shadow-[0_8px_30px_rgba(74,222,128,0.08)]";
  if (glowHover === "crimson") hoverClass = "hover:border-[#f87171]/40 hover:shadow-[0_8px_30px_rgba(248,113,113,0.08)]";
  if (glowHover === "gold") hoverClass = "hover:border-[#f59e0b]/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)]";
  if (glowHover === "white") hoverClass = "hover:border-white/30 hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]";

  return (
    <div onClick={onClick} className={`bg-gradient-to-b from-[#0f0f1a] to-[#07070b] border border-[#1e1e2e] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

