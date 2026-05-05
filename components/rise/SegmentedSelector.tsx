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
    <div className="grid gap-1 rounded-2xl bg-[#f5f2fe] p-1 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e1e0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2fe]",
            option.value === value ? "bg-white text-[#4648d4] shadow-sm ring-1 ring-[#c7c4d7]" : "text-[#464554] hover:bg-white/70 hover:text-[#1b1b23]"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
