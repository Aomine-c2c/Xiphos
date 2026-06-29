import React from "react";
import { LucideIcon } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  icon: LucideIcon;
  subtitle?: string;
  glowColor?: "cyan" | "purple" | "emerald" | "crimson" | "gold" | "white";
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, icon: Icon, subtitle, glowColor = "cyan", actions }: PageHeaderProps) => {
  const colorClass = glowColor === "white" ? "text-white" : `text-xiphos-${glowColor}`;
  const glowClass = `glow-${glowColor}`;

  return (
    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0 z-10 backdrop-blur-md">
      <div className="flex flex-col">
        <span className={`text-2xl font-black uppercase tracking-widest flex items-center gap-2 ${colorClass} ${glowClass}`}>
          <Icon className="h-5 w-5" />
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">
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
