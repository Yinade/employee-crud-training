export function getErrorMessage(err: any, fallback = "Something went wrong") {
  // Prefer a server message if present
  const msg =
    err?.message ||
    err?.payload ||
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.response?.data ||
    err?.toString();
  return typeof msg === "string" && msg.trim().length ? msg : fallback;
}
