import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  variant?: "default" | "password" | "email" | "number";
  disabled?: boolean;
  onChange?: (value: string) => void; // <-- return string
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  rightIcon,
  leftIcon,
  variant = "default",
  disabled = false,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    variant === "password"
      ? showPassword
        ? "text"
        : "password"
      : variant === "number"
      ? "text" // use text to control formatting
      : props.type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (variant === "number") {
      // hanya boleh 0–9
      value = value.replace(/[^0-9]/g, "");
    }

    // always return string value
    onChange?.(value);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block mb-1 text-sm font-medium ${
            disabled ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}

      <div
        className={`flex items-center w-full px-3 py-2 border rounded-lg bg-white 
          ${disabled ? "bg-gray-100 border-gray-300 cursor-not-allowed" : ""}
          focus-within:ring-1 focus-within:ring-blue-500
          ${error ? "border-red-500" : "border-gray-300"}
        `}
      >
        {leftIcon && (
          <span
            className={`mr-2 ${disabled ? "text-gray-300" : "text-gray-400"}`}
          >
            {leftIcon}
          </span>
        )}

        <input
          type={inputType}
          disabled={disabled}
          {...props}
          onChange={handleChange}
          className={`flex-1 bg-transparent outline-none placeholder-gray-400
            ${disabled ? "cursor-not-allowed text-gray-400" : "text-gray-900"}`}
        />

        {variant === "password" && (
          <button
            type="button"
            disabled={disabled}
            className={`ml-2 ${
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => !disabled && setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {rightIcon && (
          <span
            className={`ml-2 ${disabled ? "text-gray-300" : "text-gray-400"}`}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
