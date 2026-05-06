import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export function Card({ children, className, padded = true, ...props }: CardProps) {
  return (
    <section className={cn("rounded-2xl border border-[#c7c4d7] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5", padded && "p-6", className)} {...props}>
      {children}
    </section>
  );
}
