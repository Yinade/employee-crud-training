// reusableComponents/ButtonComponents.tsx

import React from "react";
import {
  Button,
  ButtonProps,
  SxProps,
  Theme,
  IconButton,
  IconButtonProps,
} from "@mui/material";
import { colors } from "../app/utils/color";
import CloseIcon from "@mui/icons-material/Close";

// 1. Submit Button
export const SubmitButton: React.FC<
  ButtonProps & {
    length?: string;
    width?: string;
    name?: string;
    fontSize?: string;
    hoverFontSize?: string;
  }
> = ({
  length,
  width,
  name = "Submit",
  fontSize = "1.1rem",
  hoverFontSize = "1.2rem",
  sx,
  disabled,
  ...props
}) => (
  <Button
    variant="outlined"
    color="primary"
    disabled={disabled}
    sx={{
      pointerEvents: disabled ? "none" : undefined,
      cursor: disabled ? "not-allowed" : "pointer",
      backgroundColor: disabled
        ? colors.disabledBackground
        : colors.buttonBackground,
      color: disabled ? "#F0F0F0" : "#fff",
      fontWeight: 400,
      fontSize,
      borderRadius: "6px",
      textTransform: "none",
      width: length,
      height: width,
      "&:hover": disabled
        ? {}
        : {
            borderColor: colors.buttonBackground,
            backgroundColor: colors.buttonBackground,
            fontSize: hoverFontSize,
            color: "#fff",
            fontWeight: 700,
            borderRadius: "6px",
          },
      ...sx,
    }}
    {...props} // ✅ Correct placement
  >
    {name}
  </Button>
);

// 2. Cancel Button
export const CancelButton: React.FC<
  ButtonProps & {
    length?: string;
    width?: string;
    name?: string;
    fontSize?: string;
    hoverFontSize?: string;
  }
> = ({
  length,
  width,
  name = "Cancel",
  fontSize = "1.1rem",
  hoverFontSize = "1.2rem",
  sx,
  ...props
}) => (
  <Button
    variant="outlined"
    color="inherit"
    sx={{
      color: colors.buttonBackground,
      borderColor: colors.focusBorder,
      backgroundColor: colors.selectedBackground,
      fontWeight: 700,
      fontSize,
      borderRadius: "6px",
      textTransform: "none",
      width: length,
      height: width,
      "&:hover": {
        backgroundColor: colors.selectedBackground,
        borderColor: colors.buttonBackground,
        color: colors.buttonBackground,
        fontSize: hoverFontSize,
        fontWeight: 600,
        borderWidth: "2px",
      },
      ...sx,
    }}
    {...props}
  >
    {name}
  </Button>
);

// 3. Reset Button
export const ResetButton: React.FC<
  ButtonProps & {
    length?: string;
    width?: string;
    name?: string;
    fontSize?: string;
    hoverFontSize?: string;
  }
> = ({
  length,
  width,
  name = "Cancel",
  fontSize = "1.1rem",
  hoverFontSize = "1.2rem",
  sx,
  ...props
}) => (
  <Button
    variant="outlined"
    color="inherit"
    sx={{
      color: colors.buttonBackground,
      borderColor: colors.focusBorder,
      backgroundColor: colors.selectedBackground,
      fontWeight: 700,
      fontSize,
      borderRadius: "6px",
      textTransform: "none",
      width: length,
      height: width,
      "&:hover": {
        backgroundColor: colors.selectedBackground,
        borderColor: colors.buttonBackground,
        color: colors.buttonBackground,
        fontSize: hoverFontSize,
        fontWeight: 600,
        borderWidth: "2px",
      },
      ...sx,
    }}
    {...props}
  >
    {name}
  </Button>
);

// 4. Add Row Button
export const AddRowButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <div className="w-full">
    <button
      onClick={onClick}
      className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 transition"
    >
      + Add
    </button>
  </div>
);

// 5. Delete Row Icon Button
export const DeleteRowIcon: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <button
    onClick={onClick}
    className="text-red-500 hover:text-red-700 transition"
    title="Delete Row"
  >
    🗑️
  </button>
);

// 6. Select Head Tab Button
export const SelectHeadTab: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}> = ({ onClick, children, active = false }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded text-lg font-bold font-[Monaco] transition-colors duration-200 ${
      active
        ? "bg-gradient-to-r from-[#52BAAE] to-[#3BBEE3] border-transparent text-white"
        : "bg-transparent border-gray-200 text-gray-800 hover:bg-blue-500 hover:border-blue-600 hover:text-white"
    }`}
  >
    {children}
  </button>
);

// 7. Normal Button
export const NormalButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="px-6 py-2 bg-blue-600 text-white font-medium rounded shadow hover:bg-blue-700 transition"
  >
    {children}
  </button>
);

interface ButtonPropsDraft {
  length?: string;
  width?: string;
  name?: string;
  fontSize?: string;
  hoverFontSize?: string;
  sx?: SxProps<Theme>;
}

// 8. SaveDraftButton
export const SaveDraftButton: React.FC<
  ButtonPropsDraft & React.ComponentProps<typeof Button>
> = ({
  length,
  width,
  name = "Save as Draft",
  fontSize = "1.1rem",
  hoverFontSize = "1.2rem",
  sx,
  ...props
}) => (
  <Button
    variant="outlined"
    color="inherit"
    sx={{
      color: colors.buttonBackground,
      borderColor: colors.focusBorder,
      backgroundColor: colors.selectedBackground,
      fontWeight: 700,
      fontSize,
      borderRadius: "6px",
      textTransform: "none",
      width: length,
      height: width,
      "&:hover": {
        backgroundColor: colors.selectedBackground,
        borderColor: colors.buttonBackground,
        color: colors.buttonBackground,
        fontSize: hoverFontSize,
        fontWeight: 600,
        borderWidth: "2px",
      },
      ...sx,
    }}
    {...props}
  >
    {name}
  </Button>
);

// 9. Close Icon Button (red X)
export const CloseIconButton: React.FC<IconButtonProps> = ({
  sx,
  ...props
}) => (
  <IconButton
    aria-label="close"
    size="small"
    sx={{
      borderRadius: "50%",
      padding: 0.5,
      ...sx, // per-usage overrides (like color & position)
    }}
    {...props}
  >
    <CloseIcon fontSize="small" />
  </IconButton>
);

// 10. Delete Button
export const DeleteButton: React.FC<
  ButtonProps & {
    length?: string;
    width?: string;
    name?: string;
    fontSize?: string;
    hoverFontSize?: string;
  }
> = ({
  length,
  width,
  name = "Delete",
  fontSize = "1.1rem",
  hoverFontSize = "1.2rem",
  sx,
  disabled,
  ...props
}) => (
  <Button
    variant="outlined"
    color="error"
    disabled={disabled}
    sx={{
      pointerEvents: disabled ? "none" : undefined,
      cursor: disabled ? "not-allowed" : "pointer",
      backgroundColor: disabled ? colors.disabledBackground : "#e53935",
      color: "#fff",
      borderColor: "#e53935",
      fontWeight: 500,
      fontSize,
      borderRadius: "6px",
      textTransform: "none",
      width: length,
      height: width,
      "&:hover": disabled
        ? {}
        : {
            backgroundColor: "#c62828",
            borderColor: "#c62828",
            color: "#fff",
            fontSize: hoverFontSize,
            fontWeight: 700,
          },
      ...sx,
    }}
    {...props}
  >
    {name}
  </Button>
);
