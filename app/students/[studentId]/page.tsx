"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, CalendarDays, FilePlus2, Pencil, UserRound } from "lucide-react";
import { AppActivityCard } from "../../../components/rise/AppActivityCard";
import { ProtectedContent } from "../../../components/rise/AuthProvider";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Card } from "../../../components/rise/Card";
import { Footer } from "../../../components/rise/Footer";
import { ProgressSegments } from "../../../components/rise/ProgressSegments";
import { ReportSectionCard } from "../../../components/rise/ReportSectionCard";
import { TopNav } from "../../../components/rise/TopNav";
import { useToast } from "../../../components/rise/ToastProvider";
import { TutorKeyBadge } from "../../../components/rise/TutorKeyBadge";
import { getStudentAppActivitySummary } from "../../../lib/appActivity";
import { getStudent, listReports, listSessions } from "../../../lib/supabaseData";
import { initialsFromName } from "../../../lib/tutorKey";
import type { ChildProfile, ReportRow, SessionLog, StudentAppActivitySummary } from "../../../types/rise";

export default function StudentOverviewPage() {
  const params = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<ChildProfile | null>(null);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [appActivity, setAppActivity] = useState<StudentAppActivitySummary | null>(null);
  const [status, setStatus] = useState("Loading student...");
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [child, sessionData, reportData] = await Promise.all([
          getStudent(params.studentId),
          listSessions(params.studentId),
          listReports(params.studentId),
        ]);
        const activityData = await getStudentAppActivitySummary(child, sessionData[0]?.sessionDate);
        setStudent(child);
        setSessions(sessionData);
        setReports(reportData);
        setAppActivity(activityData);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load student.");
      }
    }

    load();
  }, [params.studentId]);

  const latestSession = sessions[0];
  const progressValue = latestSession?.progressRating ?? (student?.confidenceLevel as 1 | 2 | 3 | 4 | 5 | undefined) ?? 3;
  const visibleSessions = sessions.slice(0, 5);

  if (!student) {
    return (
      <ProtectedContent>
        <main className="rise-page min-h-screen animate-rise-page">
          <TopNav />
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4 text-sm font-semibold text-[var(--rise-text-muted)]">{status}</p>
          </div>
          <Footer />
        </main>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <main className="rise-page min-h-screen animate-rise-page">
        <TopNav />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--rise-purple)]">Student overview</p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--rise-heading)]">{student.fullName}</h1>
              <p className="mt-2 text-lg text-[var(--rise-text-muted)]">
                {student.educationStage || "Education stage not set"} · {student.yearGroup}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/sessions/new/${student.id}`}>
                <BrandButton>
                  <FilePlus2 className="h-4 w-4" />
                  Log New Session
                </BrandButton>
              </Link>
              <Link href={`/students/new?childId=${student.id}`}>
                <BrandButton variant="secondary">
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </BrandButton>
              </Link>
              <Link href="/students">
                <BrandButton variant="secondary">
                  <UserRound className="h-4 w-4" />
                  Back to Students
                </BrandButton>
              </Link>
            </div>
          </header>

          {status ? <p className="mb-6 rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4 text-sm font-semibold text-[var(--rise-text-muted)]">{status}</p> : null}

          <section className="mb-8 grid gap-6 lg:grid-cols-12">
            <Card className="flex flex-col gap-5 lg:col-span-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--rise-purple-soft)] text-2xl font-black text-[var(--rise-purple)]">
                    {initialsFromName(student.fullName)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold text-[var(--rise-heading)]">{student.fullName}</h2>
                      <span className="rounded-full bg-[var(--rise-purple-soft)] px-3 py-1 text-xs font-bold text-[var(--rise-purple)]">{student.status || "active"}</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--rise-text-muted)]">
                      {student.subjects.join(" / ") || "No subjects set"} · {student.school || "School not set"}
                    </p>
                  </div>
                </div>
                <div className="w-full max-w-sm">
                  <TutorKeyBadge
                    tutorKey={student.tutorKey}
                    onCopy={() => {
                      setStatus("Tutor key copied.");
                      toast({ title: "Tutor key copied", description: `${student.fullName}'s key is on the clipboard.`, variant: "success" });
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
                  <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Current level / grade</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--rise-heading)]">{student.currentWorkingLevel}</p>
                </div>
                <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
                  <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Target level / grade</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--rise-heading)]">{student.targetLevel}</p>
                </div>
                <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
                  <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Tutor key</p>
                  <p className="mt-2 font-mono text-lg font-black tracking-widest text-[var(--rise-purple)]">{student.tutorKey}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4">
                  <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Goals</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">{student.mainGoals || "No goals added yet."}</p>
                </div>
                <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4">
                  <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Learning style</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">{student.learningStyle || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4">
                  <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Strengths</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">{student.strengths?.length ? student.strengths.join(", ") : "Not set"}</p>
                </div>
                <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4">
                  <p className="text-xs font-bold uppercase text-[var(--rise-text-soft)]">Struggles</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">{student.struggles?.length ? student.struggles.join(", ") : "Not set"}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-6 lg:col-span-4">
              <Card className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--rise-text-soft)]">Progress</p>
                  <div className="mt-3">
                    <ProgressSegments value={progressValue} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--rise-text-muted)]">
                    Latest session: {latestSession ? `${latestSession.topic} on ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(latestSession.sessionDate))}` : "No sessions logged yet."}
                  </p>
                </div>
                <div className="border-t border-[var(--rise-border)] pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--rise-text-soft)]">Parent contact</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--rise-heading)]">{student.parentName}</p>
                  <p className="text-sm text-[var(--rise-text-muted)]">{student.parentEmail || "No parent email set"}</p>
                  <p className="mt-2 text-sm text-[var(--rise-text-muted)]">{student.parentRelationship || "Parent / guardian"}</p>
                </div>
                <div className="border-t border-[var(--rise-border)] pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--rise-text-soft)]">Current plan</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">{student.currentHomework || "No homework set."}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">{student.nextSessionFocus || "No next focus added yet."}</p>
                </div>
              </Card>
              <AppActivityCard summary={appActivity} />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-[#4648d4]" />
                <h2 className="text-xl font-semibold text-[#1b1b23]">Recent sessions</h2>
              </div>
              {visibleSessions.length ? (
                <div className="space-y-3">
                  {visibleSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/sessions/new/${student.id}?sessionId=${session.id}`}
                      className="group block rounded-2xl border border-[#e9e6f3] bg-[#f5f2fe] p-4 transition hover:-translate-y-0.5 hover:border-[#4648d4] hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase text-[#767586]">
                            {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(session.sessionDate))}
                          </p>
                          <p className="truncate text-sm font-semibold text-[#1b1b23]">{session.topic}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-[#464554]">{session.quickNotes}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span className="rounded-full bg-[#e1e0ff] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#4648d4]">
                            Edit
                          </span>
                          <p className="text-[11px] text-[#767586]">{session.homeworkDetails || "No homework set"}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {sessions.length > visibleSessions.length ? (
                    <Link href={`/sessions?studentId=${student.id}`}>
                      <BrandButton variant="secondary" className="w-full">
                        View all sessions
                      </BrandButton>
                    </Link>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-[#464554]">No sessions logged yet.</p>
              )}
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-[#4648d4]" />
                <h2 className="text-xl font-semibold text-[#1b1b23]">Recent reports</h2>
              </div>
              <div className="space-y-3">
                {reports.length ? (
                  reports.slice(0, 3).map((report) => (
                    <div key={report.id} className="rounded-xl border border-[#e9e6f3] bg-[#f5f2fe] p-4">
                      <p className="text-sm font-semibold text-[#1b1b23]">{report.title}</p>
                      <p className="mt-1 text-sm text-[#464554]">{report.sent_status || "draft"}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/reports/${report.id}`}>
                          <BrandButton variant="secondary">View</BrandButton>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#464554]">No reports generated yet.</p>
                )}
              </div>
            </Card>
          </section>
        </div>
        <Footer />
      </main>
    </ProtectedContent>
  );
}
