"use client";

import { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export function Label({ className = "", ...props }: LabelProps) {
  const baseStyles = "text-[#08075C] font-medium text-sm";

  return <label className={`${baseStyles} ${className}`} {...props} />;
}