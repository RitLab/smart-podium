import React from "react";
import clsx from "clsx";
import type { SizeType, VariantType } from "@/types/ui";

type ButtonProps = {
  children: React.ReactNode;
  variant?: VariantType;
  outline?: boolean;
  soft?: boolean;
  size?: SizeType;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors";

const sizes = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const variants = {
  primary: {
    solid: "bg-blue-800 text-white hover:bg-blue-900",
    outline: "border border-blue-800 text-blue-800 hover:bg-blue-50",
    soft: "bg-blue-100 text-blue-900 hover:bg-blue-200",
  },
  error: {
    solid: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-red-500 text-red-500 hover:bg-red-50",
    soft: "bg-red-100 text-red-700 hover:bg-red-200",
  },
  success: {
    solid: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-green-600 text-green-600 hover:bg-green-50",
    soft: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  warning: {
    solid: "bg-yellow-500 text-white hover:bg-yellow-600",
    outline: "border border-yellow-500 text-yellow-500 hover:bg-yellow-50",
    soft: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  },
  neutral: {
    solid: "bg-gray-300 text-gray-800 hover:bg-gray-400",
    outline: "border border-gray-400 text-gray-600 hover:bg-gray-100",
    soft: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
  dark: {
    solid: "bg-black text-white hover:bg-gray-900",
    outline: "border border-black text-black hover:bg-gray-100",
    soft: "bg-gray-800 text-gray-200 hover:bg-gray-700",
  },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  outline,
  soft,
  size = "md",
  iconLeft,
  iconRight,
  className,
  onClick,
  disabled,
}) => {
  const styleType = outline ? "outline" : soft ? "soft" : "solid";

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        baseStyles,
        sizes[size],
        variants[variant][styleType],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {iconLeft && <span className="w-4 h-4">{iconLeft}</span>}
      {children}
      {iconRight && <span className="w-4 h-4">{iconRight}</span>}
    </button>
  );
};
