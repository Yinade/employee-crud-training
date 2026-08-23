import axiosPaymentInstance from "./axiosPaymentInstance";

export interface Unit {
  id: number;
  name: string;
  description: string;
}

const UNITS_URL = "units";

export const fetchUnits = () => axiosPaymentInstance.get<Unit[]>(`units`);

export const createUnit = (data: { name: string; description: string }) =>
  axiosPaymentInstance.post<Unit>(UNITS_URL, data);

export const updateUnit = (
  id: number,
  data: { name: string; description: string }
) => axiosPaymentInstance.put<Unit>(`units/${id}`, data);

export const deleteUnit = (id: number) =>
  axiosPaymentInstance.delete(`units/${id}`);

export const checkUnitLinked = (id: number) =>
  axiosPaymentInstance.get<boolean>(`units/${id}/is-linked`);
