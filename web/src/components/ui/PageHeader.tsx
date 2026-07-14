import React from "react";
import { LucideIcon } from "lucide-react";

export interface PageHeaderProps {
 title: string;
 icon: LucideIcon;
 subtitle?: string;
 glowColor?: "cyan" | "purple" | "emerald" | "crimson" | "gold" | "white"; // Kept for API compatibility, but unused
 actions?: React.ReactNode;
}

export const PageHeader = ({ title, icon: Icon, subtitle, actions }: PageHeaderProps) => {
 return (
 <div className="p-4 border-b border-[#1e1e2e] flex items-center justify-between bg-[#09090e] shrink-0 z-10">
 <div className="flex flex-col">
 <span className="text-lg font-display font-semibold uppercase tracking-widest flex items-center gap-2 text-[#e8e8f0]">
 <Icon className="h-5 w-5 text-[#a78bfa]" />
 {title}
 </span>
 {subtitle && (
 <span className="text-xs text-[#94a3b8] font-display font-semibold uppercase tracking-widest mt-1">
 {subtitle}
 </span>
 )}
 </div>
 {actions && (
 <div className="flex items-center gap-4">
 {actions}
 </div>
 )}
 </div>
 );
};
