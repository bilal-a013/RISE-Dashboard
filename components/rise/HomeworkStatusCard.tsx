import { AlertCircle, CheckCircle2, Circle, Clock3, HelpCircle } from "lucide-react";
import { formatActivityTimestamp } from "../../lib/appActivity";
import type { HomeworkTaskRow, HomeworkTaskStatus } from "../../types/rise";
import { Card } from "./Card";

const statusContent: Record<
  HomeworkTaskStatus,
  { label: string; className: string; Icon: typeof Circle }
> = {
  not_started: {
    label: "Not started",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    Icon: Circle,
  },
  in_progress: {
    label: "In progress",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    Icon: Clock3,
  },
  completed: {
    label: "Completed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Icon: CheckCircle2,
  },
  need_help: {
    label: "Needs help",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: HelpCircle,
  },
};

function statusBadge(status: HomeworkTaskStatus) {
  const content = statusContent[status] ?? statusContent.not_started;
  const Icon = content.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${content.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {content.label}
    </span>
  );
}

export function HomeworkStatusCard({ tasks }: { tasks: HomeworkTaskRow[] | null }) {
  const latestHomework = tasks?.[0] ?? null;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--rise-text-soft)]">Homework status</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--rise-heading)]">RISE APP homework</h2>
        </div>
        <div className="rounded-2xl bg-[var(--rise-purple-soft)] p-3 text-[var(--rise-purple)]">
          <AlertCircle className="h-5 w-5" />
        </div>
      </div>

      {latestHomework ? (
        <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-base font-semibold text-[var(--rise-heading)]">{latestHomework.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">
                {latestHomework.instructions || "No instructions added."}
              </p>
            </div>
            <div className="shrink-0">{statusBadge(latestHomework.status)}</div>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Last updated</p>
              <p className="mt-1 font-semibold text-[var(--rise-heading)]">{formatActivityTimestamp(latestHomework.updated_at)}</p>
            </div>
            {latestHomework.completed_at ? (
              <div>
                <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Completed</p>
                <p className="mt-1 font-semibold text-[var(--rise-heading)]">{formatActivityTimestamp(latestHomework.completed_at)}</p>
              </div>
            ) : null}
          </div>

          {latestHomework.student_note ? (
            <div className="mt-4 rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-3">
              <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Student note</p>
              <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">{latestHomework.student_note}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
          <p className="text-sm font-semibold text-[var(--rise-heading)]">No app homework activity yet.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">
            Homework updates from RISE APP will appear here once this student starts a task.
          </p>
        </div>
      )}
    </Card>
  );
}
