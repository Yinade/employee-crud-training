import React from "react";
import {
  Controller,
  Control,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";
import { KTIcon } from "../_metronic/helpers";

export interface RadioOption<TValue extends string> {
  value: TValue;
  label: string;
  iconName: string; // KendoThemes icon name
  disabled?: boolean;
}

interface RadioInputGroupProps<T extends FieldValues, TValue extends string> {
  name: Path<T>;
  control: Control<T>;
  errors?: FieldErrors<T>;
  options: RadioOption<TValue>[];
  value?: TValue;
  onChange?: (value: TValue) => void | Promise<void>;
  disabled?: boolean;
}

const RadioInputGroup = <T extends FieldValues, TValue extends string>({
  name,
  control,
  errors,
  options,
  value,
  onChange,
  disabled = false,
}: RadioInputGroupProps<T, TValue>) => {
  const errorMessage = errors?.[name]?.message as string | undefined;

  return (
    <div className="radio-inputs">
      <style>
        {`
          .radio-inputs {
            display: flex;
            justify-content: center;
            align-items: center;
            max-width: 350px;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          .radio-inputs > * {
            margin: 6px;
          }
          .radio-input:checked + .radio-tile {
            border-color: #369d7a;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
            color: #369d7a;
          }
          .radio-input:checked + .radio-tile:before {
            transform: scale(1);
            opacity: 1;
            background-color: #369d7a;
            border-color: #369d7a;
          }
          .radio-input:checked + .radio-tile .radio-icon svg {
            stroke: #369d7a;
          }
          .radio-input:checked + .radio-tile .radio-label {
            color: #369d7a;
          }
          .radio-input:focus + .radio-tile {
            border-color: #369d7a;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1), 0 0 0 4px #b5c9fc;
          }
          .radio-input:focus + .radio-tile:before {
            transform: scale(1);
            opacity: 1;
          }
          .radio-tile {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 80px;
            min-height: 80px;
            border-radius: 0.5rem;
            border: 2px solid #b5bfd9;
            background-color: #fff;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
            transition: 0.15s ease;
            cursor: pointer;
            position: relative;
          }
          .radio-tile:before {
            content: "";
            position: absolute;
            display: block;
            width: 0.75rem;
            height: 0.75rem;
            border: 2px solid #b5bfd9;
            background-color: #fff;
            border-radius: 50%;
            top: 0.25rem;
            left: 0.25rem;
            opacity: 0;
            transform: scale(0);
            transition: 0.25s ease;
          }
          .radio-tile:hover {
            border-color: #369d7a;
          }
          .radio-tile:hover:before {
            transform: scale(1);
            opacity: 1;
          }
          .radio-icon {
            width: 2rem;
            height: 2rem;
          }
          .radio-label {
            color: #707070;
            transition: 0.375s ease;
            text-align: center;
            font-size: 13px;
          }
          .radio-input {
            clip: rect(0 0 0 0);
            -webkit-clip-path: inset(100%);
            clip-path: inset(100%);
            height: 1px;
            overflow: hidden;
            position: absolute;
            white-space: nowrap;
            width: 1px;
          }
          .radio-input:disabled + .radio-tile {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      </style>
      <Controller
        name={name}
        control={control}
        render={() => (
          <>
            {options.map((option) => {
              const optionDisabled = disabled || option.disabled === true;

              return (
                <label
                  key={option.value}
                  className="radio-input-container"
                  aria-disabled={optionDisabled}
                >
                  <input
                    className="radio-input"
                    type="radio"
                    name={name as string}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => {
                      if (optionDisabled) return;

                      if (onChange) {
                        void onChange(option.value);
                      }
                    }}
                    disabled={optionDisabled}
                  />

                  <span className="radio-tile">
                    <span className="radio-icon">
                      <KTIcon iconName={option.iconName} className="fs-2" />
                    </span>

                    <span className="radio-label">{option.label}</span>
                  </span>
                </label>
              );
            })}
            {errorMessage && (
              <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default RadioInputGroup;
