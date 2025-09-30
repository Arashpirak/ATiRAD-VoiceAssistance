"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function Button({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#01ADEF] focus:ring-offset-2";
  const variantStyles = {
    default: "bg-[#01ADEF] text-white hover:bg-[#0198C7] active:bg-[#0182A0]",
    outline: "border border-[#01ADEF] bg-transparent text-[#01ADEF] hover:bg-[#01ADEF]/10",
    ghost: "bg-transparent text-[#01ADEF] hover:bg-[#01ADEF]/10",
  };
  const sizeStyles = {
    default: "px-4 py-2",
    sm: "px-3 py-1 text-sm",
    lg: "px-6 py-3 text-lg",
    icon: "w-10 h-10 flex items-center justify-center",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}