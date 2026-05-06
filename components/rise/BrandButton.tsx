import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

type BrandButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "dark";
  children: ReactNode;
};

export function BrandButton({ variant = "primary", className, children, ...props }: BrandButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(85,70,232,0.22)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rise-bg)]",
        variant === "primary" && "rise-button-primary hover:-translate-y-0.5 hover:opacity-95",
        variant === "secondary" && "rise-button-secondary hover:-translate-y-0.5 hover:bg-[var(--rise-surface-soft)]",
        variant === "dark" && "bg-[var(--rise-text)] text-[var(--rise-bg)] hover:-translate-y-0.5 hover:opacity-95",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
