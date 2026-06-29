import React from "react";

export type StatusVariant = "success" | "danger" | "warning" | "info" | "neutral";

export interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

export const StatusBadge = ({ label, variant = "neutral", className = "" }: StatusBadgeProps) => {
  let colorClass = "";
  
  switch (variant) {
    case "success":
      colorClass = "bg-xiphos-emerald/20 text-xiphos-emerald border-xiphos-emerald/50";
      break;
    case "danger":
      colorClass = "bg-xiphos-crimson/20 text-xiphos-crimson border-xiphos-crimson/50";
      break;
    case "warning":
      colorClass = "bg-xiphos-gold/20 text-xiphos-gold border-xiphos-gold/50";
      break;
    case "info":
      colorClass = "bg-xiphos-cyan/20 text-xiphos-cyan border-xiphos-cyan/50";
      break;
    case "neutral":
    default:
      colorClass = "bg-white/10 text-white border-white/20";
      break;
  }

  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded border tracking-widest uppercase ${colorClass} ${className}`}>
      {label}
    </span>
  );
};
