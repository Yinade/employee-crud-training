// adapters.tsx
import {
  FloatingInput,
  AlignedSelect,
  RHFDatePickerFloating,
  FloatingSelect,
} from "./inputComponents";
import type { DynamicRowInput } from "./types";

export const DRTextInput: DynamicRowInput = (props) => {
  const { label = "", ...rest } = props as any;
  return <FloatingInput label={label} {...(rest as any)} />;
};

export const DRSelect: DynamicRowInput = (props) => {
  const { label = "", options = [], ...rest } = props as any;
  return <AlignedSelect label={label} options={options} {...(rest as any)} />;
};

export const DRDateInput: DynamicRowInput = (props) => {
  const { label = "", ...rest } = props as any;
  return <RHFDatePickerFloating label={label} {...(rest as any)} />;
};

export const DRFloatingSelect: DynamicRowInput = (props) => {
  const { label = "", options = [], ...rest } = props as any;
  return <FloatingSelect label={label} options={options} {...(rest as any)} />;
};
