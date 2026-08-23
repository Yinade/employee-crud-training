import axios from "axios";
import { getAuth } from "../utils/authUtils";

const IDENTITY_ACCOUNTS_API_URL =
  import.meta.env.VITE_APP_IDENTITY_ACCOUNTS_API_URL ??
  "/Api/v1/identity-service/accounts";

const identityAccountsClient = axios.create({
  baseURL: IDENTITY_ACCOUNTS_API_URL,
  headers: { Accept: "application/json" },
});

identityAccountsClient.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.api_token) {
    config.headers.Authorization = `Bearer ${auth.api_token}`;
  }
  return config;
});

export default identityAccountsClient;
