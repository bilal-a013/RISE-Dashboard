import { Activity, Clock3, Footprints, GraduationCap } from "lucide-react";
import { activityEventTitle, formatActivityTimestamp } from "../../lib/appActivity";
import type { StudentAppActivitySummary } from "../../types/rise";
import { Card } from "./Card";

function activitySinceLabel(count: number | null) {
  if (count === null) return "Activity since the last tutor session will appear once a session is logged.";
  if (count === 0) return "No activity since the last tutor session.";
  if (count === 1) return "1 event since the last tutor session.";
  return `${count} events since the last tutor session.`;
}

export function AppActivityCard({ summary }: { summary: StudentAppActivitySummary | null }) {
  const recentActivity = summary?.recentActivity ?? [];
  const hasActivity = recentActivity.length > 0;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--rise-text-soft)]">App activity</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--rise-heading)]">RISE APP read-back</h2>
        </div>
        <div className="rounded-2xl bg-[var(--rise-purple-soft)] p-3 text-[var(--rise-purple)]">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--rise-heading)]">
          <Clock3 className="h-4 w-4 text-[var(--rise-purple)]" />
          Last active: {summary?.lastActiveAt ? formatActivityTimestamp(summary.lastActiveAt) : "Not active yet"}
        </p>
        <p className="mt-2 text-sm text-[var(--rise-text-muted)]">{activitySinceLabel(summary?.activitySinceLastSession ?? null)}</p>
      </div>

      {summary?.unavailableReason ? (
        <p className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-3 text-sm font-medium text-[var(--rise-text-muted)]">
          {summary.unavailableReason}
        </p>
      ) : null}

      <div>
        <h3 className="text-sm font-bold uppercase text-[var(--rise-text-soft)]">Recent activity</h3>
        {hasActivity ? (
          <div className="mt-3 space-y-3">
            {recentActivity.map((event) => (
              <div key={event.id} className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-3">
                <p className="text-sm font-semibold text-[var(--rise-heading)]">{activityEventTitle(event)}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-wide text-[var(--rise-purple)]">{event.activity_type}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--rise-text-soft)]">{formatActivityTimestamp(event.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--rise-heading)]">No app activity yet</p>
            <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">
              When this student uses RISE APP, their activity will appear here.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--rise-text-soft)]">
            <Footprints className="h-4 w-4 text-[var(--rise-purple)]" />
            Progress
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--rise-heading)]">{summary?.progressPlaceholder ?? "No app progress yet"}</p>
        </div>
        <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--rise-text-soft)]">
            <GraduationCap className="h-4 w-4 text-[var(--rise-purple)]" />
            Lessons
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--rise-heading)]">{summary?.lessonAttemptsPlaceholder ?? "No lesson attempts yet"}</p>
        </div>
      </div>
    </Card>
  );
}
