import axiosInstance from "./axiosConfig";
import { UserModel } from "../models/user.model";
import { RoleForFilter } from "../models/role.model";
import axios from "axios";
import { AuthModel } from "../modules/auth";
import accountsAxios from "./accountsAxios";
import identityAccountsClient from "./identityAccountsInstance";
import { LeanUserModel } from "../models/user.model";

const BASE_URL = "accounts";

export const fetchUserById = (accountId: number) =>
  identityAccountsClient.get<UserModel>(`${accountId}`); // no leading slash

export const createUser = async (formData: FormData) => {
  const url = `${BASE_URL}/register`;

  try {
    const response = await axiosInstance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.log("trying to catch error");
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message || "An error occurred";
      throw new Error(message);
    }
    throw new Error("Unable to create user");
  }
};

export const fetchLeanUsers = () => {
  return axiosInstance.get<LeanUserModel[]>(`${BASE_URL}/lean`);
};

export const updateProfilePicture = async (
  accountId: number,
  profilePicture: File,
) => {
  const formData = new FormData();
  formData.append("profilePicture", profilePicture);
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/${accountId}/profile-picture`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message || "An error occurred";
      throw new Error(message);
    }
    throw new Error("Unable to update profile picture");
  }
};

export const updateAccountStatus = async (
  accountId: number,
  status: string,
) => {
  const url = `${BASE_URL}/updateStatus`;
  const payload = { accountId, status };

  try {
    const response = await axiosInstance.put(url, payload);
    return response.data; // Return success response if no error occurs
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // Extract the backend error message

      const message = error.response.data?.message || "An error occurred";
      throw new Error(message);
    }
    throw new Error("Unable to update account status"); // Generic error message
  }
};

export const updateUser = async (
  accountId: number,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    userType: "INTERNAL" | "CLIENT";
    roleIds: number[];

    // INTERNAL
    departmentId?: number;

    // CLIENT
    company?: string;
    tinNo?: string;
  },
  profilePicFile?: File | null,
): Promise<UserModel> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, String(v))); // roleIds repeated
    } else {
      formData.append(key, String(value));
    }
  });

  if (profilePicFile) formData.append("profilePicture", profilePicFile);

  try {
    const res = await axiosInstance.put<UserModel>(
      `${BASE_URL}/${accountId}/update`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return res.data; // ✅ IMPORTANT
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message || "An error occurred";
      throw new Error(message);
    }
    throw new Error("Unable to update user");
  }
};

export const updatePassword = (payload: {
  accountId: number;
  newPassword: string;
}) => axiosInstance.put(`${BASE_URL}/updatePassword`, payload);

export const updateEmail = (payload: { accountId: number; newEmail: string }) =>
  axiosInstance.put(`${BASE_URL}/updateEmail`, payload);

export const updateStatus = (payload: {
  accountId: number;
  newStatus: string;
}) => axiosInstance.put(`${BASE_URL}/updateStatus`, payload);

export const addRoleToUser = (accountId: number, roleId: number) =>
  axiosInstance.put(`${BASE_URL}/${accountId}/addRole/${roleId}`);

export const removeRoleFromUser = (accountId: number, roleId: number) =>
  axiosInstance.put(`${BASE_URL}/${accountId}/removeRole/${roleId}`);

export const fetchUsersByRoleTypes = (roleName?: string) => {
  const url = roleName
    ? `${BASE_URL}/filterByRole?roleName=${roleName}`
    : `${BASE_URL}/filterByRole?roleName=ALL`;
  return axiosInstance.get<UserModel[]>(url);
};

export const fetchAllUsers = () => {
  const url = `${BASE_URL}/filterByRole?roleName=ALL`;
  return axiosInstance.get<UserModel[]>(url);
};

// export const updateAccountStatus = (accountId: number, status: string) => {
//   const url = `${BASE_URL}/updateStatus`;
//   const payload = { accountId, status };

//   return axiosInstance.put(url, payload);
// };

export const deleteUserApi = async (accountId: number) => {
  try {
    await axiosInstance.delete(`${BASE_URL}/${accountId}`);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // Extract the backend error message

      const message = error.response.data?.message || "An error occurred";
      throw new Error(message);
    }
    throw new Error("Unable to update account status"); // Generic error message
  }
};

export const fetchUsersByType = async (userType: string) => {
  try {
    return await axiosInstance.get<UserModel[]>(`${BASE_URL}/filterByType`, {
      params: { userType },
    });
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // Extract the backend error message

      const message = error.response.data?.message || "An error occurred";
      throw new Error(message);
    }
    throw new Error("Unable to update account status"); // Generic error message
  }
};

export const fetchRoleTypes = async () =>
  await axiosInstance.get<RoleForFilter[]>(`roles`);

export const fetchUserTypes = async () => {
  const response = await axiosInstance.get<string[]>(`enums/user-types`);
  return response.data; // Returns [{ name: "CLIENT", displayName: "Client" }, ...]
};

export interface PasswordResetModel {
  email: string;
}

export const requestPasswordReset = async (payload: {
  email: string;
}): Promise<void> => {
  try {
    const response = await axiosInstance.post(
      `public/auth/request-password-reset`,
      payload,
    );
    return response.data; // Optional: Handle response as needed
  } catch (error) {
    throw new Error("Failed to reset password.");
  }
};

export const resetPassword = async (payload: {
  token: string | null;
  password: string;
}) => {
  const url = `public/auth/reset-password`;

  try {
    const response = await axiosInstance.post(url, payload);
    return response.data; // The response includes api_token and refreshToken
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || "An error occurred");
    }
    throw new Error("Unable to reset password");
  }
};
