// src/app/payment-service/api/axiosPaymentInstance.ts
import axios, { AxiosInstance } from "axios";
import { getAuth } from "../../utils/authUtils";
import { logAxiosError } from "../../utils/httpError";

const PAYMENT_API_URL =
  import.meta.env.VITE_APP_PAYMENT_API_URL || "/Api/v1/payment-service/";

const axiosPaymentInstance: AxiosInstance = axios.create({
  baseURL: PAYMENT_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosPaymentInstance.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.api_token) {
    // make sure headers is defined
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${auth.api_token}`;
  }
  return config;
});

axiosPaymentInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const serverMsg = error?.response?.data?.message;

    if (serverMsg) error.message = serverMsg;
    else if (status === 401)
      error.message = "401: You must be logged in to access this resource.";
    else if (status === 403)
      error.message = "403: You don’t have permission to view this page.";

    return Promise.reject(error);
  }
);

axiosPaymentInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only in dev if you want:
    if (process.env.NODE_ENV !== "production") {
      logAxiosError(error, "payment");
    }
    return Promise.reject(error);
  }
);

export default axiosPaymentInstance;
