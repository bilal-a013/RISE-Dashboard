import type { SessionLog } from "../../types/rise";
import { cn } from "./utils";

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));
}

export function SessionTimeline({ sessions }: { sessions: SessionLog[] }) {
  return (
    <div className="relative space-y-5">
      <span className="absolute bottom-3 left-2 top-3 w-px bg-[#c7c4d7]" />
      {sessions.slice(0, 3).map((session, index) => (
        <div key={session.id} className="relative pl-8">
          <span
            className={cn(
              "absolute left-0 top-1.5 h-4 w-4 rounded-full border-2",
              index === 0 ? "border-white bg-[#4648d4] shadow-sm" : "border-[#c7c4d7] bg-[#efecf8]"
            )}
          />
          <p className="text-xs font-bold uppercase text-[#767586]">{formatShortDate(session.sessionDate)}</p>
          <p className="text-sm font-semibold text-[#1b1b23]">{session.topic}</p>
          <p className="text-sm text-[#464554]">{session.quickNotes}</p>
        </div>
      ))}
    </div>
  );
}
