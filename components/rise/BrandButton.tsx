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
        "inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e1e0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        variant === "primary" && "bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] text-white shadow-lg shadow-[#4648d4]/20 hover:-translate-y-0.5 hover:opacity-95",
        variant === "secondary" && "border border-[#c7c4d7] bg-white text-[#464554] hover:-translate-y-0.5 hover:bg-[#f5f2fe]",
        variant === "dark" && "bg-[#1b1b23] text-white hover:-translate-y-0.5 hover:bg-[#303038]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
