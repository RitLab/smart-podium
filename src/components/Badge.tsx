import React from "react";
import clsx from "clsx";
import { SizeType, VariantType } from "../types/ui.types";

type BadgeProps = {
  children: React.ReactNode;
  variant?: VariantType;
  outline?: boolean;
  soft?: boolean;
  size?: SizeType;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
};

const baseStyles = "inline-flex items-center gap-1 rounded-full font-medium";

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

const variants = {
  primary: {
    solid: "bg-blue-600 text-white",
    outline: "border border-blue-600 text-blue-600",
    soft: "bg-blue-100 text-blue-700",
  },
  error: {
    solid: "bg-red-500 text-white",
    outline: "border border-red-500 text-red-500",
    soft: "bg-red-100 text-red-700",
  },
  success: {
    solid: "bg-green-600 text-white",
    outline: "border border-green-600 text-green-600",
    soft: "bg-green-100 text-green-700",
  },
  warning: {
    solid: "bg-yellow-500 text-white",
    outline: "border border-yellow-500 text-yellow-500",
    soft: "bg-yellow-100 text-yellow-700",
  },
  neutral: {
    solid: "bg-gray-300 text-gray-800",
    outline: "border border-gray-400 text-gray-600",
    soft: "bg-gray-100 text-gray-700",
  },
  dark: {
    solid: "bg-black text-white",
    outline: "border border-black text-black",
    soft: "bg-gray-800 text-gray-200",
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  outline,
  soft,
  size = "md",
  iconLeft,
  iconRight,
  className,
}) => {
  const styleType = outline ? "outline" : soft ? "soft" : "solid";

  return (
    <span
      className={clsx(
        baseStyles,
        sizes[size],
        variants[variant][styleType],
        className
      )}
    >
      {iconLeft && <span>{iconLeft}</span>}
      {children}
      {iconRight && <span>{iconRight}</span>}
    </span>
  );
};
