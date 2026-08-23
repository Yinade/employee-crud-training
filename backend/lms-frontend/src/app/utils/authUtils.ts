// src/features/auth/authUtils.ts
import { AuthModel } from "../modules/auth/core/_models";

const AUTH_LOCAL_STORAGE_KEY = "kt-auth-react-v";

export const getAuth = (): AuthModel | undefined => {
  try {
    const lsValue = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY);
    return lsValue ? (JSON.parse(lsValue) as AuthModel) : undefined;
  } catch {
    return undefined;
  }
};

export const setAuth = (auth: AuthModel) => {
  localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(auth));
};

export const removeAuth = () => {
  localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
};
