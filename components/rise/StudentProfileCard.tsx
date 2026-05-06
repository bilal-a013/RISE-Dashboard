import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { ChildProfile, SessionLog } from "../../types/rise";
import { initialsFromName } from "../../lib/tutorKey";
import { BrandButton } from "./BrandButton";
import { Card } from "./Card";

export function StudentProfileCard({
  child,
  lastSession,
  onView,
  onEdit,
  onRemove,
}: {
  child: ChildProfile;
  lastSession?: SessionLog;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <Card
      className="flex h-full cursor-pointer flex-col gap-5 transition hover:-translate-y-0.5 hover:border-[#4648d4] hover:shadow-md"
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onView();
        }
      }}
      aria-label={`Open profile for ${child.fullName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e1e0ff] text-lg font-black text-[#4648d4]">
            {initialsFromName(child.fullName)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#1b1b23]">{child.fullName}</h3>
            <p className="text-xs font-bold uppercase tracking-wide text-[#767586]">{child.yearGroup}</p>
          </div>
        </div>
        <span className="rounded-full bg-[#6063ee] px-3 py-1 text-xs font-bold text-white">{child.tutorKey}</span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between gap-3 text-sm">
          <span className="text-[#464554]">Focus</span>
          <span className="max-w-[14rem] text-right font-medium text-[#1b1b23]">{child.subjects.join(" / ")}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#efecf8]">
            <div className="h-full w-[70%] rounded-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)]" />
          </div>
          <span className="text-sm font-bold text-[#4648d4]">
            {child.currentWorkingLevel} → {child.targetLevel.replace("Grade ", "")}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-[#f5f2fe] p-4">
        <p className="mb-1 flex items-center gap-2 text-sm text-[#464554]">
          <CalendarDays className="h-4 w-4" />
          <span className="font-semibold text-[#1b1b23]">
            Last session:
          </span>{" "}
          {lastSession ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(lastSession.sessionDate)) : "No sessions yet"}
        </p>
        <p className="text-sm font-medium text-[#1b1b23]">{lastSession?.topic || "Ready for the first session log."}</p>
        <p className="mt-1 line-clamp-2 text-sm italic text-[#464554]">"{lastSession?.quickNotes || "Ready for the first session log."}"</p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 md:grid-cols-4">
        <BrandButton variant="secondary" className="w-full" onClick={(event) => { event.stopPropagation(); onView(); }}>
          View
        </BrandButton>
        <Link href={`/sessions/new/${child.id}`} onClick={(event) => event.stopPropagation()}>
          <BrandButton className="w-full">
            Log Session
          </BrandButton>
        </Link>
        <BrandButton variant="secondary" className="w-full" onClick={(event) => { event.stopPropagation(); onEdit(); }}>
          Edit
        </BrandButton>
        <BrandButton variant="secondary" className="w-full" onClick={(event) => { event.stopPropagation(); onRemove(); }}>
          Remove
        </BrandButton>
      </div>
    </Card>
  );
}
