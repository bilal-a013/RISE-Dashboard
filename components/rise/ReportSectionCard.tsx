import type { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "./utils";

export function ReportSectionCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("h-full", className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-xl font-semibold text-[#1b1b23]">{title}</h3>
      </div>
      {children}
    </Card>
  );
}
