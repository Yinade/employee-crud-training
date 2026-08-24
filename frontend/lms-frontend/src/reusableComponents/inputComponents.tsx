// 1. Labeled Input Field
import React, { useState, useMemo, useRef, useCallback } from "react";

import {
  Controller,
  Control,
  Path,
  RegisterOptions,
  FieldError,
  UseFormReturn,
} from "react-hook-form";
import Autosuggest from "react-autosuggest";
import { DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import Select, { MultiValue } from "react-select";
import { TextField, Typography } from "@mui/material";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";

import { FieldErrors, UseFormSetValue, FieldValues } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { colors } from "../app/utils/color";
import FormLabel from "@mui/material/FormLabel";
import { ErrorMessage } from "../app/utils/ErrorMessage";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "react-phone-input-2/lib/material.css"; // base MUI styles
// import { FormHelperText, FormControl, InputLabel } from "@mui/material";
import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";

interface LabeledInputProps {
  name: string;
  label: string;
  control: Control<any>;
  placeholder?: string;
  type?: string;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({
  name,
  label,
  control,
  placeholder = "",
  type = "text",
}) => (
  <div className="flex items-center gap-2">
    <label
      htmlFor={name}
      className="w-32 text-gray-700 font-medium whitespace-nowrap"
    >
      {label}
    </label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          {...field}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      )}
    />
  </div>
);

interface BasicInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  type?: string;
  className?: string;
  value?: string | number | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  maxLength?: number;
  transformValue?: (value: string) => string;
  disabled?: boolean;
  errors?: FieldErrors<T>; // kept for compatibility, but we favor fieldState.error
}

export const BasicInput = <T extends FieldValues>({
  name,
  control,
  placeholder = "",
  type = "text",
  className = "",
  value,
  onChange,
  readOnly = false,
  disabled = false,
  errors,
  maxLength,
  transformValue,
}: BasicInputProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const errorMessage =
          fieldState.error?.message ||
          (errors?.[name] as FieldError | undefined)?.message;

        const hasError = !!errorMessage;

        const borderColor = hasError
          ? colors.errorBorder
          : isFocused
            ? colors.buttonBackground
            : colors.defaultBorder;

        return (
          <div className="flex flex-col gap-1">
            <input
              id={name as string}
              type={type}
              placeholder={placeholder}
              {...field}
              value={value !== undefined ? value : (field.value ?? "")}
              maxLength={maxLength}
              onChange={(e) => {
                let inputValue = e.target.value;

                if (transformValue) {
                  inputValue = transformValue(inputValue);
                }

                field.onChange(
                  type === "number"
                    ? inputValue
                      ? Number(inputValue)
                      : undefined
                    : inputValue || undefined,
                );

                onChange?.({
                  ...e,
                  target: {
                    ...e.target,
                    value: inputValue,
                  },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                field.onBlur();
              }}
              readOnly={readOnly}
              disabled={disabled}
              className={`w-full px-3 py-1.5 h-14 rounded-md outline-none basic-input ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              } ${hasError ? "invalid-input" : ""} ${className}`}
              style={{
                border: `1px solid ${borderColor}`,
                backgroundColor: disabled
                  ? colors.disabledBackground
                  : field.value
                    ? colors.selectedBackground
                    : "#FFFFFF",
              }}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
          </div>
        );
      }}
    />
  );
};

// export const BasicInput = <T extends FieldValues>({
//   name,
//   control,
//   placeholder = "",
//   type = "text",
//   className = "",
//   maxLength,
//   transformValue,
//   value,
//   onChange,
//   readOnly = false,
//   disabled = false,
//   errors, // Optional, for compatibility
// }: BasicInputProps<T>) => {
//   const [isFocused, setIsFocused] = useState(false);

//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field, fieldState }) => {
//         // Use fieldState.error.message; fall back to errors[name]?.message if needed
//         const errorMessage =
//           fieldState.error?.message ||
//           (errors?.[name] as FieldError | undefined)?.message;
//         const hasError = !!errorMessage; // Only true if there's a valid error message

//         const borderColor = hasError
//           ? colors.errorBorder
//           : isFocused
//             ? colors.buttonBackground
//             : colors.defaultBorder;

//         return (
//           <div className="flex flex-col gap-1">
//             <input
//               id={name as string}
//               type={type}
//               placeholder={placeholder}
//               {...field}
//               value={value !== undefined ? value : (field.value ?? "")}
//               maxLength={maxLength}
//               onChange={(e) => {
//                 let inputValue = e.target.value;

//                 if (transformValue) {
//                   inputValue = transformValue(inputValue);
//                 }

//                 field.onChange(
//                   type === "number"
//                     ? inputValue
//                       ? Number(inputValue)
//                       : undefined
//                     : inputValue || undefined,
//                 );
//                 onChange?.(e);
//               }}
//               onFocus={() => setIsFocused(true)}
//               onBlur={(e) => {
//                 setIsFocused(false);
//                 field.onBlur();
//               }}
//               readOnly={readOnly}
//               disabled={disabled}
//               className={`w-full px-3 py-1.5 h-14 rounded-md outline-none basic-input ${
//                 disabled ? "opacity-50 cursor-not-allowed" : ""
//               } ${hasError ? "invalid-input" : ""} ${className}`}
//               style={{
//                 border: `1px solid ${borderColor}`,
//                 backgroundColor: disabled
//                   ? colors.disabledBackground
//                   : field.value
//                     ? colors.selectedBackground
//                     : "#FFFFFF",
//               }}
//             />
//             {hasError && (
//               <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
//             )}
//           </div>
//         );
//       }}
//     />
//   );
// };

interface Suggestion {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface AutosuggestInputProps {
  name: string;
  suggestions: Suggestion[];
  getSuggestions: (value: string, suggestions: Suggestion[]) => Suggestion[];
  relatedField?: string;
  relatedFieldValueKey?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  onSuggestionSelected?: (
    event: React.FormEvent<any>,
    data: { suggestion: Suggestion },
  ) => void; // New prop for custom suggestion selection
  inputProps?: {
    value?: string; // Explicitly type as string
    readOnly?: boolean;
    [key: string]: any;
  };
}

export const AutosuggestInput: React.FC<AutosuggestInputProps> = ({
  name,
  suggestions,
  getSuggestions,
  relatedField,
  relatedFieldValueKey = "name",
  placeholder = `Search ${name}...`,
  disabled = false,
  className = "",
  control,
  setValue,
  errors,
  onSuggestionSelected,
  inputProps = {},
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(
    [],
  );
  const [isFocused, setIsFocused] = useState(false);

  const onSuggestionsFetchRequested = useCallback(
    ({ value }: { value: string }) => {
      setFilteredSuggestions(getSuggestions(value, suggestions));
    },
    [getSuggestions, suggestions],
  );

  const onSuggestionsClearRequested = useCallback(() => {
    setFilteredSuggestions([]);
  }, []);

  const getSuggestionValue = useCallback(
    (suggestion: Suggestion) => suggestion.name,
    [],
  );

  const renderSuggestion = useCallback(
    (suggestion: Suggestion) => (
      <span className="p-2 hover:bg-gray-100 block">{suggestion.name}</span>
    ),
    [],
  );

  const isValidInput = useCallback(
    (value: string) => {
      const trimmedValue = value.trim().toLowerCase();
      return suggestions.some((s) => s.name.toLowerCase() === trimmedValue);
    },
    [suggestions],
  );

  const defaultOnSuggestionSelected = useCallback(
    (_: any, { suggestion }: { suggestion: Suggestion }) => {
      setValue(name, suggestion.id.toString());
      setInputValue(suggestion.name);
      if (relatedField && suggestion[relatedFieldValueKey] !== undefined) {
        setValue(relatedField, suggestion[relatedFieldValueKey] || "");
      }
    },
    [setValue, name, relatedField, relatedFieldValueKey],
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const isControlled = inputProps.value !== undefined;
        const errorMessage =
          fieldState.error?.message ||
          (errors?.[name] as FieldError | undefined)?.message;
        const hasError = !!errorMessage;

        const handleChange =
          inputProps.onChange ??
          ((_: any, { newValue }: { newValue: string }) => {
            if (!inputProps?.readOnly && !disabled) {
              setInputValue(newValue);
              if (!newValue) {
                setValue(name, "");
                if (relatedField && relatedFieldValueKey)
                  setValue(relatedField, "");
              }
            }
          });

        const handleBlur =
          inputProps.onBlur ??
          (() => {
            const v = (
              isControlled ? String(inputProps.value ?? "") : inputValue
            ) as string;
            if (v && !isValidInput(v)) {
              if (!isControlled) setInputValue("");
              field.onChange("");
              if (relatedField) setValue(relatedField, "");
            }
            field.onBlur();
          });

        const handleFocus = inputProps.onFocus ?? (() => setIsFocused(true));

        return (
          <div className="flex flex-col gap-1">
            <Autosuggest
              suggestions={filteredSuggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              onSuggestionSelected={
                onSuggestionSelected || defaultOnSuggestionSelected
              }
              inputProps={{
                id: name,
                placeholder,
                value: isControlled ? (inputProps.value as string) : inputValue,
                onChange: handleChange,
                onBlur: handleBlur,
                onFocus: handleFocus,
                disabled,
                readOnly: inputProps.readOnly,
                className: `w-full h-14 px-3 py-1.5 text-xl rounded-md outline-none ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                } ${hasError ? "invalid-input" : ""} ${className}`,
                style: {
                  border: hasError
                    ? `1px solid ${colors.errorBorder}`
                    : isFocused
                      ? `1px solid ${colors.buttonBackground}`
                      : `1px solid ${colors.defaultBorder}`,
                  backgroundColor: disabled
                    ? colors.disabledBackground
                    : field.value
                      ? colors.selectedBackground
                      : "#FFFFFF",
                },
              }}
              highlightFirstSuggestion
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
          </div>
        );
      }}
    />
  );
};

interface DatePickerInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  errors?: FieldErrors<T>; // Optional for compatibility
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  slotProps?: DatePickerProps<Dayjs>["slotProps"];
  required?: boolean;
}

export const DatePickerInput = <T extends FieldValues>({
  name,
  control,
  errors, // Optional, for compatibility
  disabled = false,
  readOnly = false,
  placeholder,
  slotProps,
  required = false,
}: DatePickerInputProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const errorMessage =
          fieldState.error?.message ||
          (errors?.[name] as FieldError | undefined)?.message;

        const value =
          field.value == null
            ? null
            : typeof field.value === "string"
              ? dayjs(field.value).isValid()
                ? dayjs(field.value)
                : null
              : (field.value as Dayjs);

        return (
          <div className="flex flex-col gap-1">
            <DatePicker
              value={value}
              onChange={(date) => field.onChange(date)}
              disabled={disabled}
              readOnly={readOnly}
              format="DD-MMM-YYYY" // ✅ Abbreviated month
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  placeholder,
                  required,
                  onFocus: () => setIsFocused(true),
                  onBlur: () => {
                    setIsFocused(false);
                    field.onBlur();
                  },
                  className: `w-full px-3 py-1.5 text-xl rounded-md outline-none ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`,
                  style: {
                    border: errorMessage
                      ? `1px solid ${colors.errorBorder}`
                      : isFocused
                        ? `1px solid ${colors.buttonBackground}`
                        : `1px solid ${colors.defaultBorder}`,
                    backgroundColor: disabled
                      ? colors.disabledBackground
                      : field.value
                        ? colors.selectedBackground
                        : "#FFFFFF",
                    boxSizing: "border-box",
                  },
                  sx: {
                    "& .MuiInputBase-root": {
                      paddingRight: "5px",
                      fontSize: "14px",
                      fontWeight: 200,
                      height: "44px",
                      color: "#374151",
                    },
                    "& .MuiInputBase-input": {
                      padding: "10px 1px",
                      boxSizing: "border-box",
                    },
                    "& .MuiInputAdornment-root": {
                      marginLeft: "8px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  },
                  ...(slotProps?.textField ?? {}),
                },
                ...(slotProps ?? {}),
              }}
            />
            <ErrorMessage message={errorMessage} />
          </div>
        );
      }}
    />
  );
};

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  errors?: FieldErrors<T>;
  options?: (string | SelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectInput = <T extends FieldValues>({
  name,
  control,
  errors,
  options = [],
  placeholder = "Select...",
  disabled = false,
  className = "",
  onChange,
}: SelectInputProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <select
          id={name}
          {...field}
          value={field.value ?? ""}
          onChange={(e) => {
            field.onChange(e.target.value || undefined);
            onChange?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`w-full yidne-select  text-xl font-normal text-gray-700 rounded-md outline-none ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${errors?.[name] ? "border-red-600" : ""} ${className}`}
          style={{
            border: errors?.[name]
              ? `1px solid ${colors.errorBorder}`
              : isFocused
                ? `1px solid ${colors.buttonBackground}`
                : `1px solid ${colors.defaultBorder}`,
            backgroundColor: disabled
              ? colors.disabledBackground
              : field.value
                ? colors.selectedBackground
                : "#FFFFFF",
          }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) =>
            typeof option === "string" ? (
              <option key={option} value={option}>
                {option}
              </option>
            ) : (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ),
          )}
        </select>
      )}
    />
  );
};

export interface MultiSelectOptionForAll {
  value: number | string; // Allow string for "All" option
  label: string;
}

interface MultiSelectInputPropsForAll<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  errors?: FieldErrors<T>;
  options?: MultiSelectOptionForAll[];
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export const MultiSelectInputWithSelectAll = <T extends FieldValues>({
  name,
  control,
  errors,
  options = [],
  placeholder = "Select...",
  isLoading = false,
  isDisabled = false,
  className = "",
}: MultiSelectInputPropsForAll<T>) => {
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  const handleChange = useCallback(
    (
      selected: MultiValue<MultiSelectOptionForAll>,
      onChange: (value: (number | string)[]) => void,
    ) => {
      const allOption = options.find((option) => option.label === "All");
      const selectedValues = selected.map((opt) => opt.value);

      if (allOption && selectedValues.includes(allOption.value)) {
        // If "All" is selected, include all non-"All" option values
        onChange(
          options.filter((opt) => opt.label !== "All").map((opt) => opt.value),
        );
      } else {
        // Otherwise, use the selected values
        onChange(selectedValues);
      }
    },
    [options],
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const allOption = options.find((option) => option.label === "All");
        const isAllSelected =
          allOption &&
          Array.isArray(field.value) &&
          field.value.length ===
            options.filter((opt) => opt.label !== "All").length;
        const errorMessage =
          fieldState.error?.message ||
          (errors?.[name] as FieldError | undefined)?.message;

        return (
          <div className="flex flex-col gap-1">
            <Select
              isMulti
              id={name}
              options={options}
              value={
                isAllSelected
                  ? [allOption!] // Show only "All" when all options are selected
                  : options.filter(
                      (option) =>
                        Array.isArray(field.value) &&
                        field.value.includes(option.value),
                    )
              }
              onChange={(selected) =>
                handleChange(selected, (value) => field.onChange(value))
              }
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                field.onBlur();
              }}
              isOptionDisabled={(option: MultiSelectOptionForAll): boolean =>
                !!isAllSelected && option.label !== "All"
              }
              placeholder={placeholder}
              isLoading={isLoading}
              isDisabled={isDisabled}
              className={`basic-input ${
                isDisabled ? "opacity-50 cursor-not-allowed" : ""
              } ${errorMessage ? "invalid-input" : ""} ${className}`}
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  border: errorMessage
                    ? `1px solid ${colors.errorBorder}`
                    : isFocused
                      ? `1px solid ${colors.buttonBackground}`
                      : `1px solid ${colors.defaultBorder}`,
                  borderRadius: "0.375rem",
                  backgroundColor: isDisabled
                    ? colors.disabledBackground
                    : (field.value as (number | string)[])?.length
                      ? colors.selectedBackground
                      : "#FFFFFF",
                  padding: "0.375rem 0.75rem",
                  minHeight: "56px", // Match h-14
                  fontSize: "1.25rem",
                  fontWeight: "400",
                  color: colors.textPrimary,
                  boxShadow: "none",
                  "&:hover": {
                    border: errorMessage
                      ? `1px solid ${colors.errorBorder}`
                      : isFocused
                        ? `1px solid ${colors.buttonBackground}`
                        : `1px solid ${colors.defaultBorder}`,
                  },
                }),
                option: (base, state) => ({
                  ...base,
                  fontSize: "1.3rem",
                  color: colors.textPrimary,
                  backgroundColor: state.isFocused
                    ? colors.buttonBackground
                    : "#FFFFFF",
                  "&:hover": {
                    backgroundColor: colors.buttonBackground,
                    color: "#FFFFFF",
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: colors.buttonBackground,
                  borderRadius: "0.25rem",
                  textColor: "#ffffff",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#6B7280",
                  fontSize: "1.25rem",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  fontSize: "1.4rem",
                  color: "#FFFFFF",
                  fontWeight: "400",
                }),
              }}
            />
            <ErrorMessage message={errorMessage} />
          </div>
        );
      }}
    />
  );
};

interface MultiSelectOption {
  value: number;
  label: string;
}

interface MultiSelectInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  errors?: FieldErrors<T>;
  options?: MultiSelectOption[];
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export const MultiSelectInput = <T extends FieldValues>({
  name,
  control,
  errors,
  options = [],
  placeholder = "Select...",
  isLoading = false,
  isDisabled = false,
  className = "",
  menuZIndex = 2000, // ✅ new prop for z-index
}: MultiSelectInputProps<T> & { menuZIndex?: number }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          isMulti
          id={name}
          options={options}
          value={options.filter((option) =>
            (field.value as number[])?.includes(option.value),
          )}
          onChange={(selected) =>
            field.onChange(selected ? selected.map((opt) => opt.value) : [])
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          isLoading={isLoading}
          isDisabled={isDisabled}
          className={`basic-input ${
            isDisabled ? "opacity-50 cursor-not-allowed" : ""
          } ${errors?.[name] ? "border-red-600" : ""} ${className}`}
          classNamePrefix="react-select"
          menuPortalTarget={document.body} // ✅ renders dropdown in portal
          menuPosition="fixed" // ✅ fixes it over other elements
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: menuZIndex }),
            control: (base) => ({
              ...base,
              border: errors?.[name]
                ? `1px solid ${colors.errorBorder}`
                : isFocused
                  ? `1px solid ${colors.buttonBackground}`
                  : `1px solid ${colors.defaultBorder}`,
              borderRadius: "0.375rem",
              backgroundColor: isDisabled
                ? colors.disabledBackground
                : (field.value as number[])?.length
                  ? colors.selectedBackground
                  : "#FFFFFF",
              padding: "0.375rem 0.75rem",
              minHeight: "3.5rem",
              fontSize: "1.25rem",
              fontWeight: "400",
              color: colors.textPrimary,
              boxShadow: "none",
              "&:hover": {
                border: errors?.[name]
                  ? `1px solid ${colors.errorBorder}`
                  : isFocused
                    ? `1px solid ${colors.buttonBackground}`
                    : `1px solid ${colors.defaultBorder}`,
              },
            }),
            option: (base, state) => ({
              ...base,
              fontSize: "1.25rem",
              color: colors.textPrimary,
              backgroundColor: state.isFocused
                ? colors.buttonBackground
                : "#FFFFFF",
              "&:hover": {
                backgroundColor: colors.buttonBackground,
                color: "#FFFFFF",
              },
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: colors.buttonBackground,
              borderRadius: "0.25rem",
              textColor: "#ffffff",
            }),
            placeholder: (base) => ({
              ...base,
              color: "#6B7280",
              fontSize: "1.25rem",
            }),
            multiValueLabel: (base) => ({
              ...base,
              fontSize: "1.25rem",
              color: "#FFFFFF",
              fontWeight: "300",
            }),
          }}
        />
      )}
    />
  );
};

// src/reusableComponents/DetailDrawer.tsx
import { Drawer, IconButton, Button, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface DetailRowProps {
  label: string;
  value?: React.ReactNode;
  fontScale?: number;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  fontScale = 1,
}) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        fontWeight: 500,
        minWidth: 120,
        fontSize: `calc(0.875rem * ${fontScale}) !important`,
      }}
    >
      {label}:
    </Typography>
    <Typography
      variant="body2"
      sx={{
        ml: 8,
        wordBreak: "break-word",
        fontSize: `calc(0.875rem * ${fontScale}) !important`,
      }}
    >
      {value ?? "—"}
    </Typography>
  </Box>
);

export interface DetailDrawerAction<T> {
  label: string;
  onClick: (data: T) => void;
  variant?: "contained" | "outlined" | "text";
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  disabled?: (data: T) => boolean;
}

export interface DetailDrawerProps<T extends object> {
  open: boolean;
  onClose: () => void;
  title?: string;
  data?: T | null;
  width?: number | string;
  actions?: DetailDrawerAction<T>[];
  renderDetails?: (data: T) => React.ReactNode;
  fallbackMessage?: string;
  /** Global scale applied to header, body, rows, and custom content */
  fontScale?: number; // defaults to 1
}

const DetailDrawer = <T extends object>({
  open,
  onClose,
  title = "Details",
  data,
  width = 420,
  actions = [],
  renderDetails,
  fallbackMessage = "Select an item to view details.",
  fontScale = 1,
}: DetailDrawerProps<T>) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width } }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="h6"
          sx={{ flex: 1, fontSize: `calc(1.25rem * ${fontScale}) !important` }}
        >
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close details">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        sx={{
          px: 2,
          pb: 2,
          flex: 1,
          /**
           * Force font scaling for ALL descendants in the body —
           * covers your custom renderDetails content too.
           */
          "&, & *": {
            fontSize: `calc(0.875rem * ${fontScale}) !important`,
            lineHeight: 1.5,
          },
        }}
      >
        {data ? (
          <>
            {renderDetails ? (
              renderDetails(data)
            ) : (
              <Typography color="text.secondary">
                No custom renderer provided.
              </Typography>
            )}

            {actions.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                {actions.map((act, idx) => (
                  <Button
                    key={idx}
                    variant={act.variant ?? "contained"}
                    color={act.color ?? "primary"}
                    onClick={() => act.onClick(data)}
                    disabled={act.disabled?.(data)}
                    size="medium"
                  >
                    {act.label}
                  </Button>
                ))}
              </Stack>
            )}
          </>
        ) : (
          <Typography sx={{ p: 2 }} color="text.secondary">
            {fallbackMessage}
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default DetailDrawer;

interface TextAreaInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  className?: string;
  value?: string | undefined;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  readOnly?: boolean;
  disabled?: boolean;
  errors?: FieldErrors<T>;
}

interface TextAreaInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  className?: string;
  value?: string | undefined;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  readOnly?: boolean;
  disabled?: boolean;
  errors?: FieldErrors<T>;
}

export const TextAreaInput = <T extends FieldValues>({
  name,
  control,
  placeholder = "",
  className = "",
  value,
  onChange,
  readOnly = false,
  disabled = false,
  errors,
}: TextAreaInputProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <textarea
          id={name}
          placeholder={placeholder}
          {...field}
          value={value !== undefined ? value : (field.value ?? "")}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            field.onChange(e.target.value || undefined);
            onChange?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          readOnly={readOnly}
          disabled={disabled}
          className={`w-full px-3 py-1.5 rounded-md outline-none basic-input resize-none text-base text-gray-900 h-12 transition-all duration-200 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${errors?.[name] ? "border-red-600" : ""} ${className}`}
          style={{
            border: errors?.[name]
              ? `1px solid ${colors.errorBorder}`
              : isFocused
                ? `1px solid ${colors.buttonBackground}`
                : `1px solid ${colors.defaultBorder}`,
            backgroundColor: disabled
              ? colors.disabledBackground
              : field.value
                ? colors.selectedBackground
                : "#FFFFFF",
          }}
        />
      )}
    />
  );
};

interface FileInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  accept?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  disabled?: boolean;
  errors?: FieldErrors<T>;
  maxSizeMB?: number; // Optional max file size in MB
}

export const FileInput = <T extends FieldValues>({
  name,
  control,
  accept = "",
  className = "",
  onChange,
  readOnly = false,
  disabled = false,
  errors,
  maxSizeMB = 20, // Default to 20MB
}: FileInputProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <input
          id={name}
          type="file"
          accept={accept}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            if (file && maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
              alert(
                `File size exceeds ${maxSizeMB}MB. Please select a smaller file.`,
              );
              return;
            }
            field.onChange(file);
            onChange?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          readOnly={readOnly}
          disabled={disabled}
          className={`w-full px-3 py-1.5 rounded-md outline-none basic-input text-base text-gray-900 h-12 transition-all duration-200 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${errors?.[name] ? "border-red-600" : ""} ${className}`}
          style={{
            border: errors?.[name]
              ? `1px solid ${colors.errorBorder}`
              : isFocused
                ? `1px solid ${colors.buttonBackground}`
                : `1px solid ${colors.defaultBorder}`,
            backgroundColor: disabled
              ? colors.disabledBackground
              : field.value
                ? colors.selectedBackground
                : "#FFFFFF",
          }}
        />
      )}
    />
  );
};

interface FloatingInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  type?: "text" | "textarea" | "email" | "password";
  rows?: number;
  className?: string;
  controlled?: boolean;

  // Optional external control — use ONLY if you pass controlled={true}
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;

  disabled?: boolean;
  errors?: FieldErrors<T>;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
  variant?: "input" | "floating" | "compact";
  heightPx?: number;

  // ✅ NEW (opt-in): only changes when caller passes them
  labelFontSizePx?: number;
  inputFontSizePx?: number;

  /** number-only helpers */
  numeric?: boolean;
  allowDecimal?: boolean;
  allowNegative?: boolean;
  maxLength?: number;

  /** external hooks */
  onBlur?: () => void;
  onFocus?: () => void;
}

const sanitizeNumeric = (
  raw: string,
  {
    allowDecimal,
    allowNegative,
    maxLength,
  }: { allowDecimal?: boolean; allowNegative?: boolean; maxLength?: number },
) => {
  let s = raw;

  // Strip invalid chars first
  const allowed = allowDecimal ? /[0-9.-]/g : /[0-9-]/g;
  s = s.match(allowed)?.join("") ?? "";

  // Enforce single leading '-'
  if (!allowNegative) {
    s = s.replace(/-/g, "");
  } else {
    // keep only first '-' and only at start
    s = s.replace(/-/g, "");
    if (raw.trim().startsWith("-")) s = "-" + s;
  }

  // Enforce single '.'
  if (allowDecimal) {
    const parts = s.split(".");
    if (parts.length > 2) {
      s = parts.shift()! + "." + parts.join(""); // collapse extra dots
    }
  } else {
    s = s.replace(/\./g, "");
  }

  // Optional length cap (ignores '-' and '.')
  if (typeof maxLength === "number" && maxLength > 0) {
    const neg = s.startsWith("-") ? "-" : "";
    const body = s.replace(/^-/, "");
    const [intPart, decPart = ""] = body.split(".");
    const clippedInt = intPart.slice(0, maxLength);
    s =
      allowDecimal && decPart.length
        ? `${neg}${clippedInt}.${decPart}`
        : `${neg}${clippedInt}`;
  }

  return s;
};

export const FloatingInput = <T extends FieldValues>({
  label,
  name,
  control,
  type = "text",
  rows,
  className = "",
  value,
  onChange,
  controlled = false,
  disabled = false,
  errors,
  placeholder = "",
  rules,
  variant = "floating",
  heightPx,
  labelFontSizePx,
  inputFontSizePx,
  numeric = false,
  allowDecimal = false,
  allowNegative = false,
  maxLength,
  onBlur,
  onFocus,
}: FloatingInputProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  // ✅ KEEP YOUR CURRENT DEFAULTS (no havoc)
  const computedHeight =
    heightPx ?? (variant === "input" ? 56 : variant === "compact" ? 48 : 64);

  const hasError = Boolean(errors?.[name]);

  // ✅ defaults stay exactly as before unless caller passes px values
  const finalInputFontSize =
    inputFontSizePx != null ? `${inputFontSizePx}px` : "1.25rem";
  const finalLabelFontSize =
    labelFontSizePx != null ? `${labelFontSizePx}px` : "1.25rem";

  const sx = useMemo(
    () => ({
      mb: 2,

      "& .MuiOutlinedInput-root": {
        borderRadius: "0.375rem",
        fontSize: finalInputFontSize,
        fontWeight: 400,
        height: computedHeight,
        color: colors.textPrimary || "#374151",

        "& fieldset": {
          border: hasError
            ? `1px solid ${colors.errorBorder}`
            : isFocused
              ? `1px solid ${colors.buttonBackground}`
              : `1px solid ${colors.defaultBorder}`,
        },

        "& input": {
          height: "100%",
          boxSizing: "border-box",
          fontSize: finalInputFontSize, // ✅ text inside
        },

        "&:hover fieldset": {
          border: hasError
            ? `1px solid ${colors.errorBorder}`
            : `1px solid ${colors.buttonBackground}`,
        },

        "&.Mui-focused fieldset": {
          border: hasError
            ? `1px solid ${colors.errorBorder}`
            : `1px solid ${colors.buttonBackground}`,
        },

        backgroundColor: disabled ? colors.disabledBackground : "#FFFFFF",
      },

      "& .MuiInputLabel-root": {
        color: isFocused ? colors.buttonBackground : "#6B7280",
        fontSize: finalLabelFontSize, // ✅ label size
        fontWeight: 400,
        "&.Mui-focused": { color: colors.buttonBackground },
        "&.Mui-error": { color: colors.errorBorder },
      },

      "& .MuiFormHelperText-root": {
        color: colors.errorBorder,
        fontSize: "0.875rem",
      },
    }),
    [
      computedHeight,
      disabled,
      hasError,
      isFocused,
      finalInputFontSize,
      finalLabelFontSize,
    ],
  );

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const v = controlled ? (value ?? "") : (field.value ?? "");
        const vStr = v === null || v === undefined ? "" : String(v);

        const handleChange = (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => {
          const raw = e.target.value;
          let next = numeric
            ? sanitizeNumeric(raw, { allowDecimal, allowNegative, maxLength })
            : raw;

          if (!numeric && typeof maxLength === "number" && maxLength > 0) {
            next = next.slice(0, maxLength);
          }

          const input = e.target as HTMLInputElement;
          const selStart = input.selectionStart ?? next.length;

          if (!controlled) field.onChange(next);

          onChange?.({
            ...e,
            target: { ...e.target, value: next },
          } as any);

          requestAnimationFrame(() => {
            try {
              input.setSelectionRange(selStart, selStart);
            } catch {
              /* ignore */
            }
          });
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (!numeric) return;

          const allowedKeys = [
            "Backspace",
            "Delete",
            "Tab",
            "Escape",
            "Enter",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
          ];
          if (allowedKeys.includes(e.key)) return;

          const isDigit = /^[0-9]$/.test(e.key);
          const isDot = e.key === ".";
          const isMinus = e.key === "-";

          if (isDigit) return;
          if (isDot && allowDecimal) return;
          if (isMinus && allowNegative) {
            const target = e.currentTarget as HTMLInputElement;
            const selStart = target.selectionStart ?? 0;
            if (selStart === 0) return;
          }

          e.preventDefault();
        };

        const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
          if (!numeric) return;

          const pasted = e.clipboardData.getData("text");
          const cleaned = sanitizeNumeric(pasted, {
            allowDecimal,
            allowNegative,
            maxLength,
          });

          if (cleaned !== pasted) {
            e.preventDefault();
            const target = e.currentTarget as HTMLInputElement;
            const start = target.selectionStart ?? 0;
            const end = target.selectionEnd ?? 0;
            const current = String(
              controlled ? (value ?? "") : (field.value ?? ""),
            );
            const next = current.slice(0, start) + cleaned + current.slice(end);

            if (!controlled) field.onChange(next);

            onChange?.({
              ...e,
              target: { ...e.target, value: next },
            } as any);
          }
        };

        return (
          <TextField
            id={String(name)}
            label={label}
            value={vStr}
            onChange={handleChange}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              field.onBlur();
              setIsFocused(false);
              onBlur?.();
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            fullWidth
            variant="outlined"
            type={type && type !== "textarea" ? type : "text"}
            multiline={type === "textarea"}
            rows={type === "textarea" ? rows : undefined}
            error={hasError}
            helperText={(errors?.[name]?.message as string) || ""}
            disabled={disabled}
            placeholder={placeholder}
            className={`basic-input ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
            sx={sx}
            inputProps={{
              ...(numeric
                ? {
                    inputMode: allowDecimal ? "decimal" : "numeric",
                    pattern:
                      type !== "textarea"
                        ? allowDecimal
                          ? "[0-9]*\\.?[0-9]*"
                          : "[0-9]*"
                        : undefined,
                  }
                : {}),
              ...(typeof maxLength === "number" && maxLength > 0
                ? { maxLength }
                : {}),
            }}
          />
        );
      }}
    />
  );
};

import RadioGroup from "@mui/material/RadioGroup";

import FormHelperText from "@mui/material/FormHelperText";

interface RadioGroupComponentProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  options: { value: string; label: string }[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  disabled?: boolean;
  errors?: FieldErrors<T>;
}

export const RadioGroupComponent = <T extends FieldValues>({
  label,
  name,
  control,
  options,
  orientation = "vertical",
  className = "",
  disabled = false,
  errors,
}: RadioGroupComponentProps<T>) => {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errors?.[name]);
  const helper = (errors?.[name]?.message as string) || "";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl
          error={hasError}
          disabled={disabled}
          className={className}
          fullWidth
          component="fieldset"
        >
          <Box
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={() => setFocused(false)}
            sx={{
              border: "1px solid",
              borderColor: hasError
                ? colors.errorBorder
                : focused
                  ? colors.buttonBackground
                  : colors.defaultBorder,
              borderRadius: 1,
              px: 1.5,
              py: 1,
              bgcolor: disabled
                ? colors.disabledBackground
                : colors.evenRowBackground,
              transition: "border-color 0.2s",
              "&:hover": {
                borderColor: hasError ? colors.errorBorder : colors.textPrimary,
              },
              "& .MuiFormLabel-root": {
                color: hasError ? colors.errorBorder : colors.textPrimary,
                fontSize: "1.25rem",
                fontWeight: 400,
                "&.Mui-focused": { color: colors.buttonBackground },
                "&.Mui-error": { color: colors.errorBorder },
                "&.Mui-disabled": { color: colors.disabledBackground },
              },
              "& .MuiRadio-root": {
                color: hasError ? colors.errorBorder : colors.buttonBackground,
                "&.Mui-checked": {
                  color: colors.buttonBackground,
                },
                "&.Mui-disabled": {
                  color: colors.disabledBackground,
                },
              },
              "& .MuiFormControlLabel-label": {
                fontSize: "1.25rem",
                fontWeight: 400,
                color: disabled
                  ? colors.disabledBackground
                  : colors.textPrimary,
              },
            }}
          >
            <FormLabel id={`${name}-label`} sx={{ mb: 0.75 }}>
              {label}
            </FormLabel>
            <RadioGroup
              aria-labelledby={`${name}-label`}
              name={name}
              row={orientation === "horizontal"}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio size="small" />}
                  label={opt.label}
                  disabled={disabled}
                />
              ))}
            </RadioGroup>
          </Box>
          {hasError && (
            <FormHelperText
              sx={{ color: colors.errorBorder, fontSize: "0.875rem" }}
            >
              {helper}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

interface FloatingMultiSelectProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  options: { value: string | number; label: string }[];
  className?: string;
  disabled?: boolean;
  errors?: FieldErrors<T>;
}

export const FloatingMultiSelect = <T extends FieldValues>({
  label,
  name,
  control,
  options,
  className = "",
  disabled = false,
  errors,
}: FloatingMultiSelectProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: "0.375rem",
      fontSize: "1.25rem",
      fontWeight: 400,
      color: colors.textPrimary || "#374151",
      border: errors?.[name]
        ? `1px solid ${colors.errorBorder}`
        : state.isFocused
          ? `1px solid ${colors.buttonBackground}`
          : `1px solid ${colors.defaultBorder}`,
      backgroundColor: disabled
        ? colors.disabledBackground
        : state.hasValue
          ? colors.selectedBackground
          : "#FFFFFF",
      boxShadow: state.isFocused
        ? `0 0 0 1px ${colors.buttonBackground}`
        : "none",
      "&:hover": {
        border: errors?.[name]
          ? `1px solid ${colors.errorBorder}`
          : `1px solid ${colors.buttonBackground}`,
      },
      padding: "0.375rem 0.75rem",
      minHeight: "4.2rem",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6B7280",
      fontSize: "1.25rem",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: colors.textPrimary || "#374151",
      fontSize: "1.25rem",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: colors.buttonBackground,
      borderRadius: "0.25rem",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      fontSize: "1.25rem",
      color: "#FFFFFF",
      fontWeight: "300",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#FFFFFF",
      ":hover": {
        backgroundColor: colors.errorBorder,
        color: "#FFFFFF",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "1.25rem",
      color: colors.textPrimary,
      backgroundColor: state.isFocused ? colors.buttonBackground : "#FFFFFF",
      "&:hover": {
        backgroundColor: colors.buttonBackground,
        color: "#FFFFFF",
      },
    }),
  };

  return (
    <div
      className={`basic-input ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <label
        style={{
          fontSize: "1rem",
          fontWeight: 400,
          color: errors?.[name] ? colors.errorBorder : colors.buttonBackground,
          marginBottom: "0.25rem",
          display: "block",
        }}
      >
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            isMulti
            options={options}
            value={options.filter((option) =>
              field.value?.includes(option.value),
            )}
            onChange={(
              selected: MultiValue<{ value: string | number; label: string }>,
            ) => field.onChange(selected.map((option) => option.value))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              field.onBlur();
              setIsFocused(false);
            }}
            isDisabled={disabled}
            placeholder="Select..."
            classNamePrefix="react-select"
            styles={customStyles}
            menuPortalTarget={document.body}
          />
        )}
      />
      {errors?.[name]?.message && (
        <Typography
          color={colors.errorBorder}
          sx={{ fontSize: "0.875rem", mt: 0.5 }}
        >
          {errors[name]?.message as string}
        </Typography>
      )}
    </div>
  );
};

import { useId } from "react";

interface FloatingSelectProps<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  control?: Control<T>;
  options: { value: string | number; label: string }[];
  className?: string;
  disabled?: boolean;
  errors?: FieldErrors<T>;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
  heightPx?: number;
  onBlur?: () => void;
}

export const FloatingSelect = <T extends FieldValues>({
  label,
  name,
  control,
  options,
  className = "",
  disabled = false,
  errors,
  placeholder = "",
  rules,
  heightPx,
  onBlur, // ✅ new
}: FloatingSelectProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);
  const computedHeight = heightPx ?? 56;

  const hasValue = (v: any) =>
    v !== undefined &&
    v !== null &&
    v !== "" &&
    !(Array.isArray(v) && v.length === 0);

  const uid = useId();
  const instanceId = `${uid}-${String(name)}`;
  const inputId = `${instanceId}-input`;

  const portalTarget =
    typeof document !== "undefined" ? document.body : undefined;

  const customStyles = useMemo(
    () => ({
      control: (provided: any, state: any) => ({
        ...provided,
        borderRadius: "0.375rem",
        fontSize: "1.25rem",
        fontWeight: 400,
        color: colors.textPrimary || "#374151",
        border: errors?.[name]
          ? `1px solid ${colors.errorBorder}`
          : state.isFocused
            ? `1px solid ${colors.buttonBackground}`
            : `1px solid ${colors.defaultBorder}`,
        backgroundColor: disabled
          ? colors.disabledBackground
          : state.hasValue
            ? colors.selectedBackground
            : "#FFFFFF",
        boxShadow: state.isFocused
          ? `0 0 0 1px ${colors.buttonBackground}`
          : "none",
        "&:hover": {
          border: errors?.[name]
            ? `1px solid ${colors.errorBorder}`
            : `1px solid ${colors.buttonBackground}`,
        },
        padding: "0.375rem 0.75rem",
        minHeight: `${computedHeight}px`,
        height: `${computedHeight}px`,
        alignItems: "center",
      }),
      valueContainer: (base: any) => ({
        ...base,
        height: "100%",
        paddingTop: 0,
        alignItems: "center",
      }),
      menu: (provided: any) => ({
        ...provided,
        zIndex: 9999,
      }),
      menuPortal: (provided: any) => ({
        ...provided,
        zIndex: 9999,
      }),
      placeholder: (provided: any) => ({
        ...provided,
        color: "#6B7280",
        fontSize: "1.25rem",
      }),
      singleValue: (provided: any) => ({
        ...provided,
        color: colors.textPrimary || "#374151",
        fontSize: "1.25rem",
      }),
      option: (provided: any, state: any) => ({
        ...provided,
        fontSize: "1.25rem",
        color:
          state.isFocused || state.isSelected ? "#FFFFFF" : colors.textPrimary,
        backgroundColor:
          state.isFocused || state.isSelected
            ? colors.buttonBackground
            : "#FFFFFF",
        "&:hover": {
          backgroundColor: colors.buttonBackground,
          color: "#FFFFFF",
        },
      }),
    }),
    [computedHeight, disabled, errors, name],
  );

  return (
    <div
      className={`relative w-full ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => {
          const floating = isFocused || hasValue(field.value);

          return (
            <>
              <label
                htmlFor={inputId}
                style={{
                  position: "absolute",
                  left: 12,
                  top: floating ? -8 : "50%",
                  transform: floating ? "none" : "translateY(-50%)",
                  fontSize: floating ? "0.9rem" : "1.3rem",
                  lineHeight: 1,
                  padding: "0 4px",
                  background: "#fff",
                  color: errors?.[name]
                    ? colors.errorBorder
                    : isFocused
                      ? colors.buttonBackground
                      : "#6B7280",
                  transition: "all 120ms ease",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                {label}
              </label>

              <Select
                instanceId={instanceId}
                inputId={inputId}
                options={options}
                value={
                  options.find(
                    (o) => String(o.value) === String(field.value),
                  ) || null
                }
                onChange={(selected) =>
                  field.onChange(selected ? (selected as any).value : "")
                }
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  field.onBlur(); // RHF internal
                  setIsFocused(false);
                  onBlur?.(); // ✅ external hook for “compute on blur”
                }}
                isDisabled={disabled}
                placeholder={placeholder}
                classNamePrefix="react-select"
                styles={{
                  ...customStyles,
                  control: (base: any, state: any) => ({
                    ...customStyles.control(base, state),
                    minHeight: computedHeight,
                    paddingTop: floating ? 6 : 16,
                  }),
                }}
                menuPortalTarget={portalTarget}
                menuPosition="fixed"
                menuPlacement="auto"
                closeMenuOnScroll
                menuShouldBlockScroll
                isClearable
              />
            </>
          );
        }}
      />

      {errors?.[name]?.message && (
        <Typography
          color={colors.errorBorder}
          sx={{
            fontSize: "0.8rem",
            position: "absolute",
            top: computedHeight + 4, // 👈 just below the select (56px + 4px)
            left: 12, // 👈 aligned with left padding of the input
            transform: "none",
            pointerEvents: "none",
          }}
        >
          {errors[name]?.message as string}
        </Typography>
      )}
    </div>
  );
};

interface NoLabelFloatSelectionProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control?: Control<T>;
  options: { value: string | number; label: string }[];
  className?: string;
  disabled?: boolean;
  errors?: FieldErrors<T>;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
}

export const NoLabelFloatSelection = <T extends FieldValues>({
  label,
  name,
  control,
  options,
  className = "",
  disabled = false,
  errors,
  placeholder = "Select...",
  rules,
}: NoLabelFloatSelectionProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: "0.375rem",
      fontSize: "1.25rem",
      fontWeight: 400,
      color: colors.textPrimary || "#374151",
      border: errors?.[name]
        ? `1px solid ${colors.errorBorder}`
        : state.isFocused
          ? `1px solid ${colors.buttonBackground}`
          : `1px solid ${colors.defaultBorder}`,
      backgroundColor: disabled
        ? colors.disabledBackground
        : state.hasValue
          ? colors.selectedBackground
          : "#FFFFFF",
      boxShadow: state.isFocused
        ? `0 0 0 1px ${colors.buttonBackground}`
        : "none",
      "&:hover": {
        border: errors?.[name]
          ? `1px solid ${colors.errorBorder}`
          : `1px solid ${colors.buttonBackground}`,
      },
      padding: "0.375rem 0.75rem",
      minHeight: "0.5rem",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6B7280",
      fontSize: "1.25rem",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: colors.textPrimary || "#374151",
      fontSize: "1.25rem",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "1.25rem",
      color: colors.textPrimary,
      backgroundColor: state.isFocused ? colors.buttonBackground : "#FFFFFF",
      "&:hover": {
        backgroundColor: colors.buttonBackground,
        color: "#FFFFFF",
      },
    }),
  };

  return (
    <div
      className={`basic-input ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <label
        style={{
          fontSize: "1rem",
          fontWeight: 400,
          color: errors?.[name] ? colors.errorBorder : colors.buttonBackground,
          marginBottom: "0.25rem",
          display: "none",
        }}
      >
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Select
            options={options}
            value={
              options.find((option) => option.value === field.value) || null
            }
            onChange={(selected) =>
              field.onChange(selected ? selected.value : "")
            }
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              field.onBlur();
              setIsFocused(false);
            }}
            isDisabled={disabled}
            placeholder={placeholder}
            classNamePrefix="react-select"
            styles={customStyles}
            menuPortalTarget={document.body}
          />
        )}
      />
      {errors?.[name]?.message && (
        <Typography
          color={colors.errorBorder}
          sx={{ fontSize: "0.875rem", mt: 0.5 }}
        >
          {errors[name]?.message as string}
        </Typography>
      )}
    </div>
  );
};

import { ChangeEvent } from "react";
import { FormikErrors } from "formik";

interface FormikFloatingInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  errors?: FormikErrors<any>;
  placeholder?: string;
}

export const FormikFloatingInput: React.FC<FormikFloatingInputProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = "text",
  rows,
  className = "",
  disabled = false,
  errors,
  placeholder,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      <TextField
        id={name}
        label={label}
        value={value ?? ""}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          console.log(
            "onBlur triggered for",
            name,
            "with value:",
            e.target.value,
          );
          onBlur(e);
          setIsFocused(false);
        }}
        fullWidth
        variant="outlined"
        multiline={type === "textarea"}
        rows={type === "textarea" ? rows : undefined}
        error={!!errors?.[name]}
        helperText={errors?.[name] as string}
        disabled={disabled}
        placeholder={placeholder}
        className={`basic-input ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: "0.375rem",
            fontSize: "1.25rem",
            fontWeight: 400,
            color: colors.textPrimary || "#374151",
            "& fieldset": {
              border: errors?.[name]
                ? `1px solid ${colors.errorBorder}`
                : isFocused
                  ? `1px solid ${colors.buttonBackground}`
                  : `1px solid ${colors.defaultBorder}`,
            },
            "&:hover fieldset": {
              border: errors?.[name]
                ? `1px solid ${colors.errorBorder}`
                : `1px solid ${colors.buttonBackground}`,
            },
            "&.Mui-focused fieldset": {
              border: errors?.[name]
                ? `1px solid ${colors.errorBorder}`
                : `1px solid ${colors.buttonBackground}`,
            },
            backgroundColor: disabled
              ? colors.disabledBackground
              : value
                ? colors.selectedBackground
                : "#FFFFFF",
          },
          "& .MuiInputLabel-root": {
            color: isFocused ? colors.buttonBackground : "#6B7280",
            fontSize: "1.25rem",
            fontWeight: 400,
            "&.Mui-focused": {
              color: colors.buttonBackground,
            },
            "&.Mui-error": {
              color: colors.errorBorder,
            },
          },
          "& .MuiFormHelperText-root": {
            color: colors.errorBorder,
            fontSize: "0.875rem",
          },
        }}
      />
    </div>
  );
};

interface FormikFloatingMultiSelectProps {
  label: string;
  name: string;
  value: { value: string | number; label: string }[];
  onChange: (
    selected: MultiValue<{ value: string | number; label: string }>,
  ) => void;
  options: { value: string | number; label: string }[];
  className?: string;
  disabled?: boolean;
  errors?: FormikErrors<any>;
}

export const FormikFloatingMultiSelect: React.FC<
  FormikFloatingMultiSelectProps
> = ({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
  disabled = false,
  errors,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: "0.375rem",
      fontSize: "1.25rem",
      fontWeight: 400,
      color: colors.textPrimary || "#374151",
      border: errors?.[name]
        ? `1px solid ${colors.errorBorder}`
        : state.isFocused
          ? `1px solid ${colors.buttonBackground}`
          : `1px solid ${colors.defaultBorder}`,
      backgroundColor: disabled
        ? colors.disabledBackground
        : state.hasValue
          ? colors.selectedBackground
          : "#FFFFFF",
      boxShadow: state.isFocused
        ? `0 0 0 1px ${colors.buttonBackground}`
        : "none",
      "&:hover": {
        border: errors?.[name]
          ? `1px solid ${colors.errorBorder}`
          : `1px solid ${colors.buttonBackground}`,
      },
      padding: "0.375rem 0.75rem",
      minHeight: "4.2rem",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6B7280",
      fontSize: "1.25rem",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: colors.textPrimary || "#374151",
      fontSize: "1.25rem",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: colors.buttonBackground,
      borderRadius: "0.25rem",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      fontSize: "1.25rem",
      color: "#FFFFFF",
      fontWeight: "300",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#FFFFFF",
      ":hover": {
        backgroundColor: colors.errorBorder,
        color: "#FFFFFF",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "1.25rem",
      color: colors.textPrimary,
      backgroundColor: state.isFocused ? colors.buttonBackground : "#FFFFFF",
      "&:hover": {
        backgroundColor: colors.buttonBackground,
        color: "#FFFFFF",
      },
    }),
  };

  return (
    <div
      className={`basic-input ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <label
        style={{
          fontSize: "1rem",
          fontWeight: 400,
          color: errors?.[name] ? colors.errorBorder : colors.buttonBackground,
          marginBottom: "0.25rem",
          display: "block",
        }}
      >
        {label}
      </label>
      <Select
        isMulti
        name={name}
        options={options}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        isDisabled={disabled}
        placeholder="Select..."
        classNamePrefix="react-select"
        styles={customStyles}
        menuPortalTarget={document.body}
      />
      {errors?.[name] && (
        <Typography
          color={colors.errorBorder}
          sx={{ fontSize: "0.875rem", mt: 0.5 }}
        >
          {errors[name] as string}
        </Typography>
      )}
    </div>
  );
};

import { SingleValue } from "react-select";

interface FormikFloatingSelectProps {
  label: string;
  name: string;
  value: { value: string | number; label: string }[];
  onChange: (
    selected:
      | MultiValue<{ value: string | number; label: string }>
      | SingleValue<{ value: string | number; label: string }>,
  ) => void;
  options: { value: string | number; label: string }[];
  className?: string;
  disabled?: boolean;
  errors?: FormikErrors<any>;
  placeholder?: string;
  isMulti?: boolean;
}

export const FormikFloatingSelect: React.FC<FormikFloatingSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
  disabled = false,
  errors,
  placeholder = "Select...",
  isMulti = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: "0.375rem",
      fontSize: "1.25rem",
      fontWeight: 400,
      color: colors.textPrimary || "#374151",
      border: errors?.[name]
        ? `1px solid ${colors.errorBorder}`
        : state.isFocused
          ? `1px solid ${colors.buttonBackground}`
          : `1px solid ${colors.defaultBorder}`,
      backgroundColor: disabled
        ? colors.disabledBackground
        : state.hasValue
          ? colors.selectedBackground
          : "#FFFFFF",
      boxShadow: state.isFocused
        ? `0 0 0 1px ${colors.buttonBackground}`
        : "none",
      "&:hover": {
        border: errors?.[name]
          ? `1px solid ${colors.errorBorder}`
          : `1px solid ${colors.buttonBackground}`,
      },
      padding: "0.375rem 0.75rem",
      minHeight: "4.2rem",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6B7280",
      fontSize: "1.25rem",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: colors.textPrimary || "#374151",
      fontSize: "1.25rem",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: colors.buttonBackground,
      borderRadius: "0.25rem",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      fontSize: "1.25rem",
      color: "#FFFFFF",
      fontWeight: "300",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#FFFFFF",
      ":hover": {
        backgroundColor: colors.errorBorder,
        color: "#FFFFFF",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "1.25rem",
      color: colors.textPrimary,
      backgroundColor: state.isFocused ? colors.buttonBackground : "#FFFFFF",
      "&:hover": {
        backgroundColor: colors.buttonBackground,
        color: "#FFFFFF",
      },
    }),
  };

  return (
    <div
      className={`basic-input ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <label
        style={{
          fontSize: "1rem",
          fontWeight: 400,
          color: errors?.[name] ? colors.errorBorder : colors.buttonBackground,
          marginBottom: "0.25rem",
          display: "block",
        }}
      >
        {label}
      </label>
      <Select
        isMulti={isMulti}
        name={name}
        options={options}
        value={value}
        onChange={(selected) => {
          console.log("FormikFloatingSelect onChange:", {
            name,
            selected,
            isMulti,
          });
          onChange(selected);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        isDisabled={disabled}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={customStyles}
        menuPortalTarget={document.body}
      />
      {errors?.[name] && (
        <Typography
          color={colors.errorBorder}
          sx={{ fontSize: "0.875rem", mt: 0.5 }}
        >
          {errors[name] as string}
        </Typography>
      )}
    </div>
  );
};

import { FC } from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormikFloatingSingleSelectProps {
  label: string;
  name: string;
  value: SingleValue<SelectOption>;
  onChange: (
    selected: MultiValue<SelectOption> | SingleValue<SelectOption>,
  ) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  errors?: FormikErrors<any>;
  placeholder?: string;
}

export const FormikFloatingSingleSelect: FC<
  FormikFloatingSingleSelectProps
> = ({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
  disabled = false,
  errors,
  placeholder = "Select...",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: "0.375rem",
      fontSize: "1.25rem",
      fontWeight: 400,
      color: colors.textPrimary || "#374151",
      border: errors?.[name]
        ? `1px solid ${colors.errorBorder}`
        : state.isFocused
          ? `1px solid ${colors.buttonBackground}`
          : `1px solid ${colors.defaultBorder}`,
      backgroundColor: disabled
        ? colors.disabledBackground
        : state.hasValue
          ? colors.selectedBackground
          : "#FFFFFF",
      boxShadow: state.isFocused
        ? `0 0 0 1px ${colors.buttonBackground}`
        : "none",
      "&:hover": {
        border: errors?.[name]
          ? `1px solid ${colors.errorBorder}`
          : `1px solid ${colors.buttonBackground}`,
      },
      padding: "0.375rem 0.75rem",
      minHeight: "4.2rem",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6B7280",
      fontSize: "1.25rem",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: colors.textPrimary || "#374151",
      fontSize: "1.25rem",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "1.25rem",
      color: colors.textPrimary,
      backgroundColor: state.isFocused ? colors.buttonBackground : "#FFFFFF",
      "&:hover": {
        backgroundColor: colors.buttonBackground,
        color: "#FFFFFF",
      },
    }),
  };

  return (
    <div
      className={`basic-input ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <label
        style={{
          fontSize: "1rem",
          fontWeight: 400,
          color: errors?.[name] ? colors.errorBorder : colors.buttonBackground,
          marginBottom: "0.25rem",
          display: "block",
        }}
      >
        {label}
      </label>
      <Select
        isMulti={false}
        name={name}
        options={options}
        value={value}
        onChange={(selected) => {
          console.log("FormikFloatingSingleSelect onChange:", {
            name,
            selected,
          });
          onChange(selected);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        isDisabled={disabled}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={customStyles}
        menuPortalTarget={document.body}
      />
      {errors?.[name] && (
        <Typography
          color={colors.errorBorder}
          sx={{ fontSize: "0.875rem", mt: 0.5 }}
        >
          {errors[name] as string}
        </Typography>
      )}
    </div>
  );
};

export type AlignedSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  options?: Array<SelectOption> | string[];
  placeholder?: string;
  disabled?: boolean;
  errors?: FieldErrors<T>;
  className?: string;

  // NEW:
  variant?: "input" | "floating" | "compact"; // presets: input=56, floating=64, compact=48
  heightPx?: number; // explicit height override
  highlightColor?: string; // option hover/selected bg
  onValueChange?: (value: string | number | null) => void;
};

const toOptions = (
  opts: Array<SelectOption> | string[] = [],
): SelectOption[] =>
  opts.length && typeof (opts[0] as any) === "object"
    ? (opts as SelectOption[])
    : (opts as string[]).map((s) => ({ label: s, value: s }));

export function AlignedSelect<T extends FieldValues>({
  name,
  control,
  options,
  placeholder = "Select...",
  disabled = false,
  errors,
  className = "",
  variant = "floating", // default keeps old behavior (64px)
  heightPx,
  highlightColor,
  onValueChange,
}: AlignedSelectProps<T>) {
  const opts = useMemo(() => toOptions(options ?? []), [options]);

  const computedHeight =
    heightPx ?? (variant === "input" ? 56 : variant === "compact" ? 48 : 64);

  const hl = highlightColor ?? colors.buttonBackground;

  // 👇 Smaller font for smaller controls
  const fontSize = computedHeight <= 40 ? "0.85rem" : "1.4rem";

  const styles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: "0.375rem",
      fontSize, // ⬅️ use fontSize here
      fontWeight: 400,
      color: colors.textPrimary || "#374151",
      border: errors?.[name]
        ? `1px solid ${colors.errorBorder}`
        : state.isFocused
          ? `1px solid ${hl}`
          : `1px solid ${colors.defaultBorder}`,
      backgroundColor: disabled
        ? colors.disabledBackground
        : state.hasValue
          ? colors.selectedBackground
          : "#FFFFFF",
      boxShadow: "none",
      "&:hover": {
        border: errors?.[name]
          ? `1px solid ${colors.errorBorder}`
          : `1px solid ${hl}`,
      },
      minHeight: computedHeight,
      height: computedHeight,
      padding: "0 0.5rem", // a bit tighter
    }),
    valueContainer: (base: any) => ({
      ...base,
      height: "100%",
      padding: 0,
      display: "flex",
      alignItems: "center",
    }),
    input: (b: any) => ({ ...b, margin: 0, padding: 0 }),
    indicatorsContainer: (b: any) => ({ ...b, height: "100%" }),
    clearIndicator: (b: any) => ({ ...b, padding: "0 6px" }),
    dropdownIndicator: (b: any) => ({ ...b, padding: "0 6px" }),
    menu: (b: any) => ({ ...b, zIndex: 50 }),
    menuPortal: (b: any) => ({ ...b, zIndex: 9999 }),
    placeholder: (b: any) => ({
      ...b,
      color: "#6B7280",
      fontSize, // ⬅️ smaller placeholder too
    }),
    singleValue: (b: any) => ({
      ...b,
      color: colors.textPrimary || "#374151",
      fontSize, // ⬅️ smaller selected value
    }),
    option: (b: any, state: any) => ({
      ...b,
      fontSize, // ⬅️ smaller dropdown text
      padding: "8px 10px", // ⬅️ tighter vertical padding
      color:
        state.isFocused || state.isSelected ? "#FFFFFF" : colors.textPrimary,
      backgroundColor: state.isFocused || state.isSelected ? hl : "#FFFFFF",
      "&:hover": { backgroundColor: hl, color: "#FFFFFF" },
    }),
  };

  return (
    <div
      className={`w-full ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            classNamePrefix="react-select"
            styles={styles}
            options={opts}
            value={
              opts.find((o) => String(o.value) === String(field.value)) || null
            }
            onChange={(sel) => {
              const v = sel ? (sel as SelectOption).value : "";
              field.onChange(v);
              onValueChange?.(v ?? null);
            }}
            onBlur={field.onBlur}
            isDisabled={disabled}
            placeholder={placeholder}
            menuPortalTarget={document.body}
            isClearable={true}
          />
        )}
      />
      {errors?.[name]?.message && (
        <div className="text-red-500 text-sm mt-1">
          {String(errors[name]?.message)}
        </div>
      )}
    </div>
  );
}

interface PhoneNumberInputProps<T extends FieldValues> {
  name: Path<T>;
  control?: Control<T>;
  errors?: FieldErrors<T>;
  label?: string;
  placeholder?: string;
  defaultCountry?: string;
  disabled?: boolean;
  className?: string;
  variant?: "input" | "floating" | "compact";
  heightPx?: number;
}

export const PhoneNumberInput = <T extends FieldValues>({
  name,
  control,
  errors,
  label = "Phone Number",
  placeholder = "Enter phone number",
  defaultCountry = "et",
  disabled = false,
  className = "",
  variant = "input",
  heightPx,
}: PhoneNumberInputProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const hasError = !!errors?.[name];
  const computedHeight =
    heightPx ?? (variant === "input" ? 56 : variant === "compact" ? 48 : 64);

  const borderColor = hasError
    ? colors.errorBorder
    : isFocused
      ? colors.buttonBackground
      : colors.defaultBorder;

  const bgFor = (hasValue: boolean) =>
    disabled
      ? colors.disabledBackground
      : hasValue
        ? colors.selectedBackground
        : "#FFFFFF";

  const validatePhoneNumber = (value: string) => {
    if (!value || value === "+") {
      setLocalError(null);
      return;
    }
    try {
      const formatted = value.startsWith("+") ? value : `+${value}`;
      const pn = parsePhoneNumberFromString(
        formatted,
        defaultCountry?.toUpperCase() as CountryCode,
      );
      setLocalError(!pn || !pn.isValid() ? "Invalid phone number" : null);
    } catch {
      setLocalError("Invalid phone number format");
    }
  };

  return (
    <>
      <div className={`relative w-full mb-5 ${className}`}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <PhoneInput
              country={defaultCountry}
              disableCountryCode={false}
              enableAreaCodes={false}
              value={field.value || ""}
              onChange={(val) => {
                const v = val.startsWith("+") ? val : `+${val}`;
                field.onChange(v);
                validatePhoneNumber(v);
              }}
              onBlur={() => {
                setIsFocused(false);
                if (field.value === "+") field.onChange("");
                else validatePhoneNumber(field.value);
              }}
              onFocus={() => setIsFocused(true)}
              specialLabel={label}
              placeholder={placeholder}
              disabled={disabled}
              containerClass={`react-tel-input show-label ${
                isFocused ? "phone-label-focused" : "phone-label-default"
              }`}
              inputProps={{ name, autoFocus: false, disabled }}
              // --- IMPORTANT: no `border` shorthand anywhere ---
              inputStyle={{
                width: "100%",
                height: `${computedHeight}px`,
                paddingTop: "19px",
                paddingBottom: "16px",
                paddingLeft: "58px",
                fontSize: "1.25rem",
                borderStyle: "solid",
                borderWidth: 1,
                borderColor, // unified color
                borderLeftWidth: 0, // seam with the flag button
                borderRadius: "0.375rem", // full radius (the left corners are visually hidden by button)
                transition: "border-color 0.2s ease-in-out",
                outline: "none",
                backgroundColor: bgFor(!!field.value),
              }}
              buttonStyle={{
                height: `${computedHeight}px`,
                borderStyle: "solid",
                borderWidth: 1,
                borderColor,
                borderRightWidth: 0, // seam with the input
                borderRadius: "0.375rem 0 0 0.375rem",
                backgroundColor: bgFor(!!field.value),
              }}
              containerStyle={{
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            />
          )}
        />
        {(hasError || localError) && (
          <p className="text-xs text-red-600 mt-1">
            {localError || (errors?.[name]?.message as string)}
          </p>
        )}
      </div>

      <style>
        {`
          .hide-label .special-label { opacity: 0; visibility: hidden; }
          .show-label .special-label { opacity: 1; visibility: visible; transition: opacity .2s; }

          .react-tel-input .special-label {
            font-size: 1rem !important;
          }

          /* Kill default before/after underline that material.css adds */
          .react-tel-input .special-label::before,
          .react-tel-input .special-label::after { display: none !important; content: none !important; }

          .react-tel-input input::placeholder { opacity: 1 !important; transition: opacity .2s; }

          .react-tel-input .form-control:focus { outline: none !important; box-shadow: none !important; }

          .phone-label-default .special-label { color: #6B7280; }
          .phone-label-focused .special-label { color: ${colors.buttonBackground}; }
        `}
      </style>
    </>
  );
};

type BrandColors = {
  focus?: string;
  error?: string;
  defaultBorder?: string;
  selectedBg?: string;
  disabledBg?: string;
  text?: string;
  labelDefault?: string;
};

type RHFDatePickerFloatingProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  heightPx?: number;
  className?: string;
  colors?: BrandColors;
  datePickerProps?: Omit<
    DatePickerProps<Dayjs>,
    "value" | "onChange" | "label"
  >;
  textFieldSlotProps?: DatePickerProps<Dayjs>["slotProps"] extends infer S
    ? S extends { textField?: any }
      ? S["textField"]
      : never
    : never;
};

export function toDayjsOrNull(v: unknown): Dayjs | null {
  if (v == null || v === "" || v === undefined) return null;
  if (dayjs.isDayjs(v)) return v as Dayjs;
  const d = dayjs(v as any);
  return d.isValid() ? d : null;
}

export function RHFDatePickerFloating<T extends FieldValues>({
  name,
  control,
  errors,
  label,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  heightPx = 56,
  colors,
  className = "", // ✅ default empty string
  datePickerProps,
  textFieldSlotProps,
}: RHFDatePickerFloatingProps<T>) {
  const [isFocused, setIsFocused] = useState(false);

  const c = useMemo(
    () => ({
      focus: colors?.focus ?? "#41A371",
      error: colors?.error ?? "#EF4444",
      defaultBorder: colors?.defaultBorder ?? "#9CA3AF",
      selectedBg: colors?.selectedBg ?? "#E6FCF7",
      disabledBg: colors?.disabledBg ?? "#F3F4F6",
      text: colors?.text ?? "#374151",
      labelDefault: colors?.labelDefault ?? "#6B7280",
    }),
    [colors],
  );

  const fieldError = errors?.[name];
  const errorMessage = (fieldError?.message as string) || "";

  return (
    <div className={`relative w-full ${className}`}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            {...datePickerProps}
            label={label}
            format="DD-MMM-YY" // 👈 this controls both display & placeholder
            value={toDayjsOrNull(field.value)}
            onChange={(d) => {
              const value =
                d && d.isValid() ? d.format("YYYY-MM-DD") : undefined;
              console.log(`DatePicker [${name}] onChange:`, {
                input: d,
                output: value,
              });
              field.onChange(value);
            }}
            disabled={disabled}
            readOnly={readOnly}
            slotProps={{
              popper: {
                disablePortal: false,
                placement: "bottom-start",
                sx: { zIndex: 2000 },
              },
              textField: {
                required,
                fullWidth: true,
                // 👇 let the DatePicker's format drive the placeholder
                placeholder: "DD-MMM-YY",
                error: !!fieldError,
                helperText: errorMessage || undefined,
                onFocus: () => setIsFocused(true),
                onBlur: () => setIsFocused(false),
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.375rem",
                    fontSize: "1.25rem",
                    fontWeight: 400,
                    color: c.text,
                    height: `${heightPx}px`,
                    "& .MuiInputBase-input": {
                      padding: "10px 12px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: fieldError
                        ? c.error
                        : isFocused
                          ? c.focus
                          : c.defaultBorder,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: fieldError ? c.error : c.focus,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: fieldError ? c.error : c.focus,
                    },
                    backgroundColor: disabled
                      ? c.disabledBg
                      : field.value
                        ? c.selectedBg
                        : "#FFFFFF",
                  },
                  "& .MuiInputLabel-root": {
                    color: fieldError
                      ? c.error
                      : isFocused
                        ? c.focus
                        : c.labelDefault,
                    "&.Mui-focused": { color: fieldError ? c.error : c.focus },
                    "&.Mui-error": { color: c.error },
                  },
                  "& .MuiFormHelperText-root": {
                    color: c.error,
                    fontSize: "0.875rem",
                  },
                },
                ...textFieldSlotProps,
              },
            }}
          />
        )}
      />
    </div>
  );
}

interface RadioInputProps<T extends FieldValues> {
  name: Path<T>;
  control: UseFormReturn<T>["control"];
  error?: FieldError; // <- change here
  options: { value: string; label: string }[];
  label?: string;
  required?: boolean;
  className?: string;
}

export const RadioInput = <T extends FieldValues>({
  name,
  control,
  error,
  options,
  label,
  required,
  className = "",
}: RadioInputProps<T>) => {
  return (
    <FormControl className={`flex flex-col ${className}`}>
      {label && (
        <FormLabel className="text-xl text-black mb-2">
          {label}
          {required && <span className="text-red-500 text-2xl"> *</span>}
        </FormLabel>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex gap-4">
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={
                  <Radio
                    checked={field.value === option.value}
                    onChange={() => field.onChange(option.value)}
                    sx={{
                      color: "#9CA3AF", // Gray border when unchecked
                      "&.Mui-checked": {
                        color: "#5BC68F", // Green when checked
                      },
                      "&:hover": {
                        backgroundColor: "rgba(91, 198, 143, 0.1)", // Light green hover
                      },
                    }}
                    inputProps={{ "aria-label": option.label }}
                  />
                }
                label={
                  <span className="text-lg text-gray-700">{option.label}</span>
                }
              />
            ))}
          </div>
        )}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </FormControl>
  );
};
