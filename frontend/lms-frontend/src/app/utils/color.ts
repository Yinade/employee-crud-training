// src/styles/colors.ts
export const colors = {
  focusBorder: "#5BC68F", // Green for focused inputs
  errorBorder: "#EF4444", // Red for error states
  defaultBorder: "#9CA3AF", // Gray for default borders
  disabledBackground: "#F3F4F6", // Light gray for disabled state
  selectedBackground: "#E6FCF7", // Light green for selected inputs
  buttonBackground: "#3A9F6C", // Darker green for buttons (aligns with ResetButton/SubmitButton)
  textPrimary: "#374151", // Tailwind's gray-700
  textSecondary: "#1F2937", // Tailwind's gray-900
  errorText: "#EF4444", // Tailwind's red-500
  gradientBlue: "#3BBEE3",
  tableBackground: "#EDF1F2",
  evenRowBackground: "#F8FCFC",
  rowHoverBackground: "#E6F4EA",
  selectedRowBackground: "#F2FBED",
  toolbarBackground: "#E7F4ED",
  toolbarHoverBackground: "#D0EADF",
  checkboxDefault: "#7C929C",
  sortIconHover: "#00FFFF",
  oddRowBackground: "#f9f9f9",
} as const;

// TypeScript type for type safety
export type ColorKey = keyof typeof colors;
