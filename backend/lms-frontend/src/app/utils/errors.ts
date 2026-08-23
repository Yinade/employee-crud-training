// Robustly extract a human-friendly message from Axios/RTK errors.
export function extractApiError(err: any): string {
  // RTK createAsyncThunk with rejectWithValue may throw a string directly
  if (typeof err === "string") return err;

  const data = err?.response?.data;

  // Your ErrorResponse shape
  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim())
      return data.message;

    // Some backends send nested errors: { error: { message } }
    if (data.error && typeof data.error === "string" && data.error.trim())
      return data.error;

    if (data.detail && typeof data.detail === "string" && data.detail.trim())
      return data.detail;
  }

  // Fall back to plain Error.message
  if (err?.message) return String(err.message);

  return "Request failed — please try again.";
}
