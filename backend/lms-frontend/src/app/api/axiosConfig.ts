// src/api/axiosConfig.ts
import axios from "axios";
import { getAuth } from "../utils/authUtils";

const API_URL = import.meta.env.VITE_APP_API_URL; // e.g. /Api/v1/identity-service/

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const auth = getAuth();
    if (auth?.api_token) {
      // ✅ backticks
      config.headers.Authorization = `Bearer ${auth.api_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // Keeping AxiosError shape, but improving message if server sent one
    const serverMsg = error?.response?.data?.message;
    if (serverMsg) error.message = serverMsg;
    return Promise.reject(error);
  }
);

export default axiosInstance;