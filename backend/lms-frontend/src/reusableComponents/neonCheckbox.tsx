import React from "react";
import "./neonCheckbox.css";

interface NeonCheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant?: "gradient" | "white";
  className?: string;
}

export const NeonCheckbox: React.FC<NeonCheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  variant = "gradient",
  className,
}) => {
  return (
    <div className={`checkbox-wrapper ${variant}-checkbox ${className || ""}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.checked)
        }
      />
      <span className="checkmark" />
    </div>
  );
};
