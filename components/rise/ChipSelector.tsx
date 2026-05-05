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
            "rounded-full border px-3 py-2 text-xs font-semibold transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e1e0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            value.includes(option)
              ? "border-transparent bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] text-white shadow-sm"
              : "border-[#c7c4d7] bg-[#f5f2fe] text-[#464554] hover:border-[#4648d4] hover:bg-white"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
