// // src/app/identity-service/api/changePasswordApi.ts
// import axios from "axios";
// import type {
//   ChangePasswordRequest,
//   ChangePasswordResponse,
// } from "../models/changePassword.model";
// import axiosInstance from "./axiosConfig";

// const BASE_URL = "accounts";

// import { getAuth } from "../utils/authUtils";

// const axiosIdentityAccountsInstance = axiosInstance.create({
//   baseURL: BASE_URL,
//   headers: { Accept: "application/json", "Content-Type": "application/json" },
// });

// axiosIdentityAccountsInstance.interceptors.request.use((config) => {
//   const auth = getAuth();
//   if (auth?.api_token) {
//     config.headers.Authorization = `Bearer ${auth.api_token}`;
//   }
//   return config;
// });

// export const changeMyPassword = (data: ChangePasswordRequest) =>
//   axiosIdentityAccountsInstance.put<ChangePasswordResponse>(
//     `/me/change-password`,
//     data
//   );

// export default axiosIdentityAccountsInstance;

import axios from "axios";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../models/changePassword.model";

import { getAuth } from "../utils/authUtils";

// ✅ Base URL:
// - In dev: set VITE_APP_IDENTITY_ACCOUNTS_API_URL in .env (e.g. http://localhost:8080/Api/v1/identity-service/accounts)
// - In prod: falls back to relative path on the same origin (https://impactlms.et)
const IDENTITY_ACCOUNTS_API_URL =
  import.meta.env.VITE_APP_IDENTITY_ACCOUNTS_API_URL ??
  "/Api/v1/identity-service/accounts";

const axiosIdentityAccountsInstance = axios.create({
  baseURL: IDENTITY_ACCOUNTS_API_URL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

axiosIdentityAccountsInstance.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.api_token) {
    config.headers.Authorization = `Bearer ${auth.api_token}`;
  }
  return config;
});

// 🔁 use relative path here (no leading slash) so it always appends to baseURL correctly
export const changeMyPassword = (data: ChangePasswordRequest) =>
  axiosIdentityAccountsInstance.put<ChangePasswordResponse>(
    "me/change-password",
    data
  );

export default axiosIdentityAccountsInstance;