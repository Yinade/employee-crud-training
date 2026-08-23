// src/styles/fonts.ts
export const fonts = {
  primary:
    '"Noto Sans Ethiopic", "Chinese Quote", -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
  secondary:
    '"Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
} as const;

export const fontSizes = {
  small: "12px",
  normal: "14px",
  medium: "16px",
  large: "18px",
  xlarge: "20px",
} as const;

// TypeScript types for safety
export type FontKey = keyof typeof fonts;
export type FontSizeKey = keyof typeof fontSizes;
