// src/app/identity-service/api/departmentApi.ts
import type { Department } from "../models/department.model";

// ⬇️ IMPORTANT: use the shared axios config that injects Authorization
import axiosInstance from "../../app/api/axiosConfig"; 
// adjust path if needed: from this file to src/api/axiosConfig.ts

const DEPARTMENTS_URL = "/departments";

export const fetchDepartments = () =>
  axiosInstance.get<Department[]>(DEPARTMENTS_URL);

export const createDepartment = (data: { name: string }) =>
  axiosInstance.post<Department>(DEPARTMENTS_URL, data);

export const updateDepartment = (id: number, data: { name: string }) =>
  axiosInstance.put<Department>(`${DEPARTMENTS_URL}/${id}`, data);

export const deleteDepartment = (id: number) =>
  axiosInstance.delete(`${DEPARTMENTS_URL}/${id}`);