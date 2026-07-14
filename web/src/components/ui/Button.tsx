import React, { ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: "primary" | "secondary" | "danger" | "ghost";
 glowColor?: "cyan" | "purple" | "emerald" | "crimson" | "gold" | "white"; // Kept for compatibility
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
 let baseClass = "px-4 py-2 text-xs font-semibold tracking-widest uppercase rounded transition-all flex items-center justify-center gap-2 outline-none cursor-pointer ";
 
 if (variant === "primary") {
 baseClass += `bg-[rgba(139,92,246,0.12)] text-[#a78bfa] border border-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-[#09090e] `;
 } else if (variant === "danger") {
 baseClass += `bg-[rgba(248,113,113,0.12)] text-[#f87171] border border-[#f87171] hover:bg-[#f87171] hover:text-[#09090e] `;
 } else if (variant === "ghost") {
 baseClass += `bg-transparent border border-transparent text-[#94a3b8] hover:text-[#e8e8f0] hover:bg-[rgba(161,161,170,0.04)] `;
 } else {
 // Secondary
 baseClass += `bg-transparent border border-[#1e1e2e] hover:border-[rgba(161,161,170,0.25)] text-[#e8e8f0] hover:bg-[rgba(161,161,170,0.04)] `;
 }

 return (
 <button className={`${baseClass} ${className}`} {...props}>
 {Icon && <Icon className="w-4 h-4 shrink-0" />}
 {label || children}
 </button>
 );
};
