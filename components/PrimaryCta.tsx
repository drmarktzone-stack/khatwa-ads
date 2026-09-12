"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryCta({
  children,
  className = "",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      aria-busy={disabled ? true : undefined}
      className={`inline-flex items-center justify-center rounded-2xl bg-khatwa-green px-6 py-3 text-base font-extrabold text-white shadow-cta transition hover:-translate-y-0.5 hover:bg-khatwa-green-dark ${className}`}
    >
      {children}
    </button>
  );
}
