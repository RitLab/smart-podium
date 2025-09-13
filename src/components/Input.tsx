import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  variant?: "default" | "password" | "email";
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  rightIcon,
  leftIcon,
  variant = "default",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    variant === "password" ? (showPassword ? "text" : "password") : props.type;

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div
        className={`flex items-center w-full px-3 py-2 border rounded-lg bg-white focus-within:ring-1 focus-within:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        {leftIcon && <span className="mr-2 text-gray-400">{leftIcon}</span>}

        <input
          type={inputType}
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
          {...props}
        />

        {/* Password Toggle */}
        {variant === "password" && (
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Custom Right Icon */}
        {rightIcon && <span className="ml-2 text-gray-400">{rightIcon}</span>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
