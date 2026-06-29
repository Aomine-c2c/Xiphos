import React, { ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  glowColor?: "cyan" | "purple" | "emerald" | "crimson" | "gold" | "white";
  icon?: LucideIcon;
  label?: string;
}

export const Button = ({ 
  variant = "secondary", 
  glowColor, 
  icon: Icon, 
  label, 
  className = "", 
  children,
  ...props 
}: ButtonProps) => {
  let baseClass = "px-4 py-2 text-xs font-black tracking-widest uppercase rounded transition-all flex items-center justify-center gap-2 outline-none ";
  
  if (variant === "primary") {
    const color = glowColor || "purple";
    baseClass += `bg-xiphos-${color}/20 text-xiphos-${color} border border-xiphos-${color}/50 hover:bg-xiphos-${color} hover:text-black `;
  } else if (variant === "danger") {
    baseClass += `bg-xiphos-crimson/20 text-xiphos-crimson border border-xiphos-crimson/50 hover:bg-xiphos-crimson hover:text-black `;
  } else if (variant === "ghost") {
    baseClass += `bg-transparent border border-transparent text-white/50 hover:text-white hover:bg-white/5 `;
  } else {
    // Secondary
    baseClass += `bg-white/5 border border-white/10 hover:bg-white/10 text-white `;
  }

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {label || children}
    </button>
  );
};
