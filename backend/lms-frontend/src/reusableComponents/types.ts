// src/reusableComponents/types.ts
import type {
  Control,
  FieldErrors,
  FieldValues,
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";

/** Props that every dynamic row input (adapter) will get */
export type DynamicRowInputProps = {
  name: string; // RHF field path (e.g. "rows.0.licenseNo")
  control: Control<FieldValues>; // RHF control object
  errors?: FieldErrors<FieldValues>; // RHF validation errors
  heightPx?: number; // optional sizing for inputs
  setValue?: UseFormSetValue<any>;
  getValues?: UseFormGetValues<any>;
} & Record<string, unknown>; // allow extras like label, options, placeholder, etc.

/** The type of component allowed in `inputTypes` */
export type DynamicRowInput = React.ComponentType<DynamicRowInputProps>;

/** Public props for the DynamicRowComponent */
export interface DynamicRowComponentProps {
  columnTitles: string[];
  columnKeys?: string[];
  inputTypes: DynamicRowInput[];
  inputProps?: Record<string, unknown>[];
  heightPx?: number;
  initialRows?: Record<string, any>[];
  onChange?: (rows: Record<string, any>[]) => void;
  addButtonLabel?: string;
  disabled?: boolean;
  minRows?: number;
  maxRows?: number;
  startWithOneEmptyRow?: boolean;
}
