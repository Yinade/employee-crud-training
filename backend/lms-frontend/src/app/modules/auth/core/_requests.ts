import axios from "axios";
import { AuthModel, UserModel } from "./_models";
import type { UserModel as AppUserModel } from "../../../models/user.model"; // ✅ full model
import axiosInstance from "../../../api/axiosConfig";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}public/auth/verify_token`;
export const LOGIN_URL = `${API_URL}public/auth/login`;
export const REGISTER_URL = `${API_URL}accounts/register`;
export const REQUEST_PASSWORD_URL = `${API_URL}forgot_password`;
export const UPDATE_URL = `accounts`;

// Server should return AuthModel
export function login(email: string, password: string) {
  return axios.post<AuthModel>(LOGIN_URL, {
    email,
    password,
  });
}

export function roles() {
  return axios.get;
}

// Server should return AuthModel
// Make the department and other fields optional
export const register = async (payload: {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleIds: number[];
  user_type: string;
  departmentId?: number; // ✅ new
  company?: string; // Optional field for CLIENT users
  tinNo?: string; // Optional field for CLIENT users
}) => {
  try {
    return await axios.post(REGISTER_URL, payload);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // Extract the backend error message

      const message = error.response.data?.message || "An error occurred";
      throw new Error(message);
    }
    throw new Error("Unable to update account status"); // Generic error message
  }
};

export const registerInternalUser = async (
  payload: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleIds: number[];
    departmentId: number; // ✅ new
  },
  profilePicFile?: File | null
) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value))
      value.forEach((v) => formData.append(key, v.toString()));
    else formData.append(key, String(value));
  });
  if (profilePicFile) formData.append("profilePicture", profilePicFile);

  return await axios.post(REGISTER_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateInternalUser = async (
  accountId: number,
  payload: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    roleIds: number[];
    departmentId: number;
  },
  profilePicFile?: File | null
): Promise<AppUserModel> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value))
      value.forEach((v) => formData.append(key, String(v)));
    else formData.append(key, String(value));
  });

  if (profilePicFile) formData.append("profilePicture", profilePicFile);

  try {
    const res = await axiosInstance.put<AppUserModel>(
      `${UPDATE_URL}/${accountId}/update-internal`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data; // ✅ MUST be data
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || "An error occurred");
    }
    throw new Error("Unable to update user");
  }
};

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token: string) {
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    apiToken: token,
  });
}
