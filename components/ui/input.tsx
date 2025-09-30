"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = "", ...props }: InputProps) {
  const baseStyles =
    "rounded-md border border-[#01ADEF]/20 bg-white/10 text-[#08075C] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01ADEF] focus:border-[#01ADEF] transition-colors";

  return <input className={`${baseStyles} ${className}`} {...props} />;
}