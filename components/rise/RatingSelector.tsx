import type { Rating } from "../../types/rise";
import { cn } from "./utils";

export type RatingSelectorProps = {
  label: string;
  value: number;
  onChange: (value: Rating) => void;
  options: {
    value: Rating;
    emoji?: string;
    label: string;
  }[];
};

export const progressOptions: RatingSelectorProps["options"] = [
  { value: 1, emoji: "😟", label: "Needs support" },
  { value: 2, emoji: "🌱", label: "Building basics" },
  { value: 3, emoji: "🙂", label: "Getting there" },
  { value: 4, emoji: "💪", label: "Confident" },
  { value: 5, emoji: "🚀", label: "Strong progress" },
];

export const confidenceOptions: RatingSelectorProps["options"] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Slight" },
  { value: 3, label: "Steady" },
  { value: 4, label: "Good" },
  { value: 5, label: "High" },
];

export function RatingSelector({ label, value, onChange, options }: RatingSelectorProps) {
  return (
    <div className="rise-panel rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--rise-text)]">{label}</h3>
        <span className="text-sm font-bold text-[var(--rise-purple)]">{value}/5</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-14 rounded-xl px-2 text-center text-xs font-bold transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(85,70,232,0.18)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rise-surface)]",
              option.value === value ? "bg-[var(--rise-purple)] text-white shadow-sm ring-1 ring-[var(--rise-purple)]/10" : "bg-[var(--rise-chip)] text-[var(--rise-chip-text)] hover:bg-[var(--rise-surface)] hover:text-[var(--rise-text)]"
            )}
          >
            {option.emoji ? <span className="block text-base leading-5">{option.emoji}</span> : null}
            <span className="block">{option.value}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--rise-text-muted)]">{options.find((option) => option.value === value)?.label}</p>
    </div>
  );
}
