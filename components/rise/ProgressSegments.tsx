import { cn } from "./utils";

export function ProgressSegments({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-2.5 flex-1 rounded-full",
            index < value ? "bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)]" : "bg-[#e4e1ed]"
          )}
        />
      ))}
    </div>
  );
}
