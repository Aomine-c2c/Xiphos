import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface CollapsiblePanelProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerColor?: string;
  className?: string;
}

export function CollapsiblePanel({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  headerColor = "text-[#a78bfa]",
  className = "",
}: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <GlassCard className={`flex flex-col overflow-hidden transition-colors duration-300 !p-0 ${isOpen ? "border-[#8b5cf6]/40 shadow-[0_0_15px_rgba(139,92,246,0.1)]" : "border-[#1e1e2e]"} ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 w-full text-left bg-transparent hover:bg-white/[0.02] transition-colors focus:outline-none"
      >
        <div className={`flex items-center gap-2 text-xs font-bold tracking-widest uppercase ${headerColor}`}>
          {Icon && <Icon className="w-4 h-4" />}
          {title}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-[#94a3b8]"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 pt-0 mt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
