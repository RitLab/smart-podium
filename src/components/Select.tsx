import React from "react";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  value: string | number | undefined;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string | number) => void;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  value,
  placeholder = "Pilih...",
  disabled = false,
  onChange,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={`flex items-center w-full px-3 py-2 border rounded-lg bg-white 
          ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
          focus-within:ring-1 focus-within:ring-blue-500
          ${error ? "border-red-500" : "border-gray-300"} 
        `}
      >
        <select
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 bg-transparent outline-none ${
            disabled
              ? "cursor-not-allowed text-gray-400"
              : value === ""
              ? "text-gray-400"
              : "text-gray-900"
          }`}
          {...props}
        >
          {/* Placeholder Option */}
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
