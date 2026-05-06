import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export function Card({ children, className, padded = true, ...props }: CardProps) {
  return (
    <section className={cn("rise-panel rounded-2xl transition duration-200 hover:-translate-y-0.5", padded && "p-6", className)} {...props}>
      {children}
    </section>
  );
}
