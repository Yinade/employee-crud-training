// src/reusableComponents/theme/buttonTheme.ts
import type React from "react";
import { colors } from "../../app/utils/color"; // ✅ adjust if needed

export type ButtonVariant = "primary" | "secondary" | "mini" | "danger";
export type ButtonSize = "sm" | "md";

export const getBaseButtonStyle = (
  size: ButtonSize = "sm"
): React.CSSProperties => {
  const height = size === "md" ? "36px" : "30px";
  const fontSize = size === "md" ? "12px" : "11px";
  const padding = size === "md" ? "0 14px" : "0 10px";

  return {
    height,
    padding,
    borderRadius: "4px",
    fontSize,
    fontWeight: 700,
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
    cursor: "pointer",
    border: "1px solid transparent",
  };
};

export const getButtonStyle = (
  variant: ButtonVariant,
  enabled = true,
  size: ButtonSize = "sm"
): React.CSSProperties => {
  const base = getBaseButtonStyle(size);

  // ✅ Disabled style (neutral)
  if (!enabled) {
    return {
      ...base,
      backgroundColor: colors.toolbarBackground,
      color: colors.buttonBackground,
      borderColor: colors.toolbarBackground,
      opacity: 0.45,
      cursor: "not-allowed",
    };
  }

  // ✅ Approve (green)
  if (variant === "primary") {
    return {
      ...base,
      backgroundColor: colors.buttonBackground,
      borderColor: colors.buttonBackground,
      color: "#fff",
    };
  }

  // ✅ Secondary (light green style)
  if (variant === "secondary") {
    return {
      ...base,
      backgroundColor: colors.selectedBackground,
      borderColor: colors.buttonBackground,
      color: colors.buttonBackground,
    };
  }

  // ✅ Reject (reddish theme)
  if (variant === "danger") {
    return {
      ...base,
      backgroundColor: "#FDECEC", // light red background
      borderColor: "#F5C2C7", // soft red border
      color: "#B42318", // deep red text
    };
  }

  // ✅ mini
  return {
    ...base,
    minWidth: 70,
    backgroundColor: colors.toolbarBackground,
    color: colors.buttonBackground,
    borderColor: colors.buttonBackground,
  };
};

export const hoverOn = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.filter = "brightness(0.95)";
};

export const hoverOff = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.filter = "none";
};
