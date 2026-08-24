// utils/toastFromError.ts
import { toast } from "react-toastify";

type ApiError = any;

export function extractErrorParts(err: ApiError) {
  // axios style
  const data = err?.response?.data ?? err?.data ?? err;
  const status = data?.status ?? err?.response?.status;
  const error = data?.error;
  const code = data?.code;
  const message =
    data?.message || err?.message || "An unexpected error occurred";

  const field = data?.field;
  const rejectedValue = data?.rejectedValue;

  return { status, error, code, message, field, rejectedValue, raw: data };
}

export function toastFromError(err: ApiError, fallbackPrefix?: string) {
  const { status, error, code, message } = extractErrorParts(err);
  const prefix = code || error || fallbackPrefix || "Error";
  const suffix = status ? ` — ${status}` : "";
  toast.error(`[${prefix}] ${message}${suffix}`);
}
