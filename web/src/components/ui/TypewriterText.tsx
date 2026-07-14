"use client";

import React, { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // millisecond delay per character
  className?: string;
}

export function TypewriterText({ text, speed = 12, className = "" }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let index = 0;
    
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={className}>{displayedText}</span>;
}
