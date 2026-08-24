// Centralized Axios error logger
export function logAxiosError(err: any, context?: string) {
  // Axios error?
  const isAxios = !!err?.isAxiosError;
  const status = err?.response?.status;
  const statusTx = err?.response?.statusText;
  const url = err?.config?.url || err?.response?.config?.url;
  const method = (err?.config?.method || "").toUpperCase();
  const data = err?.response?.data;
  const headers = err?.response?.headers;

  // Keep console clean but informative
  // Use a group so it's easy to collapse
  console.group(`AXIOS ERROR ${context ? `[${context}]` : ""}`);
  console.log("Request:", { method, url });
  if (isAxios) {
    console.log("Status:", status, statusTx);
    console.log("Response headers:", headers);
    console.log("Response data:", data);
  } else {
    console.log("Non-Axios error:", err);
  }
  console.log("Original error object:", err);
  console.groupEnd();
}
