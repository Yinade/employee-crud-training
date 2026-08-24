// src/utils/toastHelper.ts
import { toast, ToastOptions } from "react-toastify";

const baseStyle: React.CSSProperties = {
  color: "#111",
  fontWeight: 500,
  borderRadius: "8px",
  borderColor: "#DDD",
};

const successStyle: ToastOptions = {
  style: { ...baseStyle, background: "#fff" },
};

const errorStyle: ToastOptions = {
  style: { ...baseStyle, background: "#fff" },
};

const infoStyle: ToastOptions = {
  style: { ...baseStyle, background: "#fff" },
};

export const notify = {
  success: (msg: string) => toast.success(msg, successStyle),
  error: (msg: string) => toast.error(msg, errorStyle),
  info: (msg: string) => toast.info(msg, infoStyle),
};