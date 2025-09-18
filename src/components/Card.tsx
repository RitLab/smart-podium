import React, { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  ...rest
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm w-full ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
