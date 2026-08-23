import axios from "axios";
import { RoleDto } from "./_models";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const GET_ROLES_URL = `${API_URL}roles`;

export async function getRoles(): Promise<RoleDto[]> {
  try {
    const response = await axios.get<RoleDto[]>(GET_ROLES_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data; // returns the list of roles with only `id` and `name`
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
}
