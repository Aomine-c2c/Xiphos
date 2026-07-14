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
 colorClass = "bg-[rgba(74,222,128,0.09)] text-[#4ade80] border border-[rgba(74,222,128,0.2)]";
 break;
 case "danger":
 colorClass = "bg-[rgba(248,113,113,0.09)] text-[#f87171] border border-[rgba(248,113,113,0.2)]";
 break;
 case "warning":
 colorClass = "bg-[rgba(245,158,11,0.09)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]";
 break;
 case "info":
 colorClass = "bg-[rgba(161,161,170,0.09)] text-[#a1a1aa] border border-[rgba(161,161,170,0.2)]";
 break;
 case "neutral":
 default:
 colorClass = "bg-[rgba(82,82,91,0.1)] text-[#94a3b8] border border-[rgba(82,82,91,0.2)]";
 break;
 }

 return (
 <span className={`text-[10px] font-semibold px-2 py-0.5 rounded tracking-widest uppercase ${colorClass} ${className}`}>
 {label}
 </span>
 );
};
