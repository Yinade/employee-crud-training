// src/app/payment-service/utils/moneyFormat.ts
const moneyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatMoney = (
  value: number | string | null | undefined
): string => {
  if (value === null || value === undefined || value === "") return "";

  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "";

  return moneyFormatter.format(n);
};