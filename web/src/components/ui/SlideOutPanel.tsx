import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: "left" | "right" | "bottom";
  width?: string;
}

export default function SlideOutPanel({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  width = "w-[560px]",
}: SlideOutPanelProps) {
  const variants = {
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
    },
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
    },
    bottom: {
      initial: { y: "100%" },
      animate: { y: 0 },
      exit: { y: "100%" },
    },
  };

  const edgeClass = position === "right"
    ? "right-0 border-l border-[#1e1e2e] top-16 bottom-0"
    : position === "left"
    ? "left-0 border-r border-[#1e1e2e] top-16 bottom-0"
    : "bottom-0 left-0 right-0 border-t border-[#1e1e2e]";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim — fixed, full screen, behind the panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Panel — fixed, slides from edge, sits above header (z-50) */}
          <motion.aside
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants[position]}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className={`fixed z-50 ${edgeClass} ${width} bg-[#07070c] backdrop-blur-2xl flex flex-col shadow-2xl font-mono`}
          >
            {/* Panel header — matches HermesConsole style exactly */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-[#1e1e2e] shrink-0 bg-[#0a0a10]">
              <span className="text-[10px] font-bold text-[#e8e8f0] uppercase tracking-widest">
                {title}
              </span>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded text-[#52525b] hover:text-white hover:bg-[#8b5cf6]/20 transition-all text-xs"
              >
                ✕
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden relative">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
