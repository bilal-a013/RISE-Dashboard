import { cn } from "./utils";

export function ChipSelector({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className={cn(
            "rounded-full border px-3 py-2 text-xs font-semibold transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(85,70,232,0.18)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rise-bg)]",
            value.includes(option)
              ? "border-transparent bg-[linear-gradient(135deg,var(--rise-purple)_0%,var(--rise-purple-2)_100%)] text-white shadow-sm"
              : "border-[var(--rise-border)] bg-[var(--rise-chip)] text-[var(--rise-chip-text)] hover:border-[var(--rise-purple)] hover:bg-[var(--rise-surface)] hover:text-[var(--rise-text)]"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
