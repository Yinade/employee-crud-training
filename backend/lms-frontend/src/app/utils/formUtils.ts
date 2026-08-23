/**
 * Converts selected alphanumeric string fields in the form data to uppercase.
 * Only fields specified in selectedFields that contain at least one alphanumeric character (a-z, A-Z, 0-9) are modified.
 *
 * @param formData The form data object (e.g., OperationFormData)
 * @param selectedFields Array of field names to process
 * @returns Modified form data with selected fields converted to uppercase
 */
export function convertSelectedFieldsToUpperCase<T extends Record<string, any>>(
  formData: T,
  selectedFields: (keyof T)[],
): T {
  const ALPHA_NUMERIC_REGEX = /[a-zA-Z0-9]+/;
  const updatedData = { ...formData };

  selectedFields.forEach((field) => {
    const value = formData[field];
    if (typeof value === "string" && ALPHA_NUMERIC_REGEX.test(value)) {
      updatedData[field] = value.toUpperCase() as T[keyof T];
    }
  });

  return updatedData;
}

export function capitalizeFirstLetterOfSentences<T extends Record<string, any>>(
  formData: T,
  selectedFields: (keyof T)[],
): T {
  const updatedData = { ...formData };

  selectedFields.forEach((field) => {
    const value = formData[field];
    if (typeof value === "string" && value.trim()) {
      updatedData[field] = value.replace(
        /(^|\.\s+|\?\s+|\!\s+)([a-z])/g,
        (_match: string, p1: string, p2: string) => {
          return p1 + p2.toUpperCase();
        },
      ) as T[keyof T];
    }
  });

  return updatedData;
}

export function capitalizeFirstLetterOfWords<T extends Record<string, any>>(
  formData: T,
  selectedFields: (keyof T)[],
): T {
  const ALPHA_NUMERIC_REGEX = /[a-zA-Z0-9]+/;
  const updatedData = { ...formData };

  selectedFields.forEach((field) => {
    const value = formData[field];

    if (typeof value === "string" && ALPHA_NUMERIC_REGEX.test(value)) {
      updatedData[field] = value
        .trim()
        .split(/\s+/) // ✅ handles multiple spaces/tabs/newlines
        .map((word: any) =>
          word.length > 0
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word,
        )
        .join(" ") as T[keyof T];
    }
  });

  return updatedData;
}

export function takeFirstNWords(value?: string | null, n: number = 2): string {
  const words = String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words.slice(0, n).join(" ");
}

// src/app/utils/numberFormat.ts

export const formatMoney = (
  value: number | string | null | undefined,
  locale: string = undefined as any,
): string => {
  const num = Number(value ?? 0);

  if (!Number.isFinite(num)) {
    return "0.00";
  }

  return num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDateShort = (dateValue?: string | Date | null): string => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};
