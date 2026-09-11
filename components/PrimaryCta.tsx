"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryCta({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl bg-khatwa-green px-6 py-3 text-base font-extrabold text-white shadow-cta transition hover:bg-khatwa-green-dark disabled:opacity-80 ${className}`}
    >
      {children}
    </button>
  );
}
