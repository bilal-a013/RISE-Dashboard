import { cn } from "./utils";

export function SegmentedSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-1 rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-1 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(85,70,232,0.18)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rise-surface-soft)]",
            option.value === value ? "bg-[var(--rise-surface)] text-[var(--rise-purple)] shadow-sm ring-1 ring-[var(--rise-purple)]" : "text-[var(--rise-text-muted)] hover:bg-[var(--rise-surface)] hover:text-[var(--rise-heading)]"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
