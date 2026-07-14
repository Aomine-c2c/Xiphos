import React from "react";

/**
 * Safely formats numerical values, currencies, or percentages.
 * If the value is null, undefined, or NaN, it returns a muted, gray em-dash (—) or formatted 0.00.
 */
export function safeFormat(
  value: number | string | null | undefined,
  options: {
    style?: "currency" | "percent" | "decimal" | "none";
    decimals?: number;
    fallback?: "dash" | "zero" | string;
  } = {}
): React.ReactNode {
  const { style = "decimal", decimals = 2, fallback = "dash" } = options;
  
  let num: number | null | undefined = undefined;
  if (typeof value === "number") {
    num = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      num = parseFloat(trimmed);
    } else {
      return value; // Return non-numeric strings directly
    }
  } else {
    num = value;
  }

  if (num === null || num === undefined || Number.isNaN(num)) {
    if (fallback === "zero") {
      return style === "currency" ? "$0.00" : style === "percent" ? "0.00%" : "0.00";
    }
    if (fallback === "dash") {
      return React.createElement("span", { className: "text-[#94a3b8] font-bold" }, "—");
    }
    return fallback;
  }

  if (style === "none") {
    return num.toFixed(decimals);
  }

  if (style === "currency") {
    // Check if the number is extremely large or standard
    return `$${num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  if (style === "percent") {
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(decimals)}%`;
  }

  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
