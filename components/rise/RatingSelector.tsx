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
    <div className="rounded-2xl border border-[#c7c4d7] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1b1b23]">{label}</h3>
        <span className="text-sm font-bold text-[#4648d4]">{value}/5</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-14 rounded-xl px-2 text-center text-xs font-bold transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e1e0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              option.value === value ? "bg-[#4648d4] text-white shadow-sm ring-1 ring-[#4648d4]/10" : "bg-[#efecf8] text-[#464554] hover:border-[#4648d4] hover:bg-white"
            )}
          >
            {option.emoji ? <span className="block text-base leading-5">{option.emoji}</span> : null}
            <span className="block">{option.value}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#464554]">{options.find((option) => option.value === value)?.label}</p>
    </div>
  );
}
