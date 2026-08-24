// 3. Labeled Select
import React from "react";
import { Controller, Control } from "react-hook-form";

interface LabeledSelectProps {
  name: string;
  label: string;
  control: Control<any>;
  options: string[];
  placeholder?: string;
}

export const LabeledSelect: React.FC<LabeledSelectProps> = ({
  name,
  label,
  control,
  options,
  placeholder = "Select",
}) => (
  <div className="flex items-center gap-2">
    <label htmlFor={name} className="w-32 text-gray-700 font-medium whitespace-nowrap">
      {label}
    </label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <select
          id={name}
          {...field}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    />
  </div>
);

// 4. Basic Select (no label)
interface BasicSelectProps {
  name: string;
  control: Control<any>;
  options: string[];
  placeholder?: string;
}

export const BasicSelect: React.FC<BasicSelectProps> = ({
  name,
  control,
  options,
  placeholder = "Select",
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <select
        {...field}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )}
  />
);
