"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CalendarClock, FileText, KeyRound, PersonStanding, Search, UsersRound } from "lucide-react";
import { BrandButton } from "../../components/rise/BrandButton";
import { Card } from "../../components/rise/Card";
import { Footer } from "../../components/rise/Footer";
import { ProtectedContent } from "../../components/rise/AuthProvider";
import { StudentProfileCard } from "../../components/rise/StudentProfileCard";
import { TopNav } from "../../components/rise/TopNav";
import { deleteStudent, listReports, listSessions, listStudents } from "../../lib/supabaseData";
import type { ChildProfile, ReportRow, SessionLog } from "../../types/rise";
import { useRouter } from "next/navigation";

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function DashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<ChildProfile[]>([]);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Loading dashboard...");

  async function loadDashboard() {
    try {
      const [studentData, sessionData, reportData] = await Promise.all([listStudents(), listSessions(), listReports()]);
      setStudents(studentData);
      setSessions(sessionData);
      setReports(reportData);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load dashboard.");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((child) => `${child.fullName} ${child.subjects.join(" ")} ${child.tutorKey}`.toLowerCase().includes(query.toLowerCase()));
  }, [query, students]);

  const weekStart = startOfWeek(new Date());
  const sessionsThisWeek = sessions.filter((session) => new Date(session.sessionDate) >= weekStart);
  const sentReports = reports.filter((report) => report.sent_status === "sent");
  const studentsNeedingAttention = students.filter((student) => student.struggles?.length || sessions.filter((session) => session.childId === student.id).length === 0);
  const upcomingSessions = sessions
    .filter((session) => new Date(session.sessionDate) >= new Date())
    .slice(0, 3);
  const recentSessions = sessions.slice(0, 3);
  const recentReports = reports.slice(0, 3);
  const nextSessionStudent = upcomingSessions[0] ? students.find((student) => student.id === upcomingSessions[0].childId) : null;

  return (
    <ProtectedContent>
      <main className="min-h-screen bg-[#fcf8ff]">
        <TopNav />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <section className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#1b1b23]">Welcome back</h1>
              <p className="mt-2 text-lg text-[#464554]">Your RISE tutoring workspace is ready for today's sessions.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/reports">
                <BrandButton variant="secondary">
                  <KeyRound className="h-4 w-4" />
                  Enter Tutor Key
                </BrandButton>
              </Link>
              <Link href="/students/new">
                <BrandButton>
                  <PersonStanding className="h-4 w-4" />
                  Create Child Profile
                </BrandButton>
              </Link>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-[#c7c4d7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#1b1b23]">Dashboard Insights</h2>
                <p className="mt-1 text-sm text-[#464554]">A quick pulse check across saved students, sessions and reports.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-5">
              {[
                { label: "Active students", value: students.filter((student) => student.status !== "archived").length, icon: UsersRound, href: "/students" },
                { label: "Sessions this week", value: sessionsThisWeek.length, icon: CalendarClock, href: "/sessions" },
                { label: "Reports sent", value: sentReports.length, icon: FileText, href: "/reports" },
                {
                  label: "Next session",
                  value: upcomingSessions[0] ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(upcomingSessions[0].sessionDate)) : "None",
                  icon: CalendarClock,
                  href: nextSessionStudent ? `/students/${nextSessionStudent.id}` : "/students",
                },
                { label: "Need attention", value: studentsNeedingAttention.length, icon: AlertCircle, href: "/students?filter=attention" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-xl border border-[#e9e6f3] bg-[#f5f2fe] p-4 transition hover:-translate-y-0.5 hover:border-[#4648d4] hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e1e0ff]"
                >
                  <item.icon className="mb-3 h-5 w-5 text-[#4648d4] transition group-hover:scale-105" />
                  <p className="text-xs font-bold uppercase text-[#767586]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#1b1b23]">{item.value}</p>
                </Link>
              ))}
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-[#e9e6f3] bg-[#fcf8ff] p-4">
                <h3 className="text-sm font-bold uppercase text-[#767586]">Today / Upcoming</h3>
                <div className="mt-3 space-y-3">
                  {upcomingSessions.length ? upcomingSessions.map((session) => (
                    <Link key={session.id} href={`/students/${session.childId}`} className="block rounded-xl border border-[#e9e6f3] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#4648d4] hover:shadow-sm">
                      <p className="text-sm font-semibold text-[#1b1b23]">{session.topic}</p>
                      <p className="text-sm text-[#464554]">{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(session.sessionDate))}</p>
                    </Link>
                  )) : <p className="text-sm text-[#464554]">No upcoming sessions yet.</p>}
                </div>
              </div>
              <div className="rounded-xl border border-[#e9e6f3] bg-[#fcf8ff] p-4">
                <h3 className="text-sm font-bold uppercase text-[#767586]">Recent sessions</h3>
                <div className="mt-3 space-y-3">
                  {recentSessions.length ? recentSessions.map((session) => (
                    <Link key={session.id} href={`/sessions/new/${session.childId}`} className="block rounded-xl border border-[#e9e6f3] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#4648d4] hover:shadow-sm">
                      <p className="text-sm font-semibold text-[#1b1b23]">{session.topic}</p>
                      <p className="text-sm text-[#464554]">{session.quickNotes}</p>
                    </Link>
                  )) : <p className="text-sm text-[#464554]">No sessions logged yet.</p>}
                </div>
              </div>
              <div className="rounded-xl border border-[#e9e6f3] bg-[#fcf8ff] p-4">
                <h3 className="text-sm font-bold uppercase text-[#767586]">Recent reports</h3>
                <div className="mt-3 space-y-3">
                  {recentReports.length ? recentReports.map((report) => (
                    <Link key={report.id} href={`/reports/${report.id}`} className="block rounded-xl border border-[#e9e6f3] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#4648d4] hover:shadow-sm">
                      <p className="text-sm font-semibold text-[#1b1b23]">{report.title}</p>
                      <p className="text-sm text-[#464554]">{report.sent_status || "draft"}</p>
                    </Link>
                  )) : <p className="text-sm text-[#464554]">No reports generated yet.</p>}
                </div>
              </div>
            </div>
          </section>

          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#767586]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search child profiles..."
              className="h-12 w-full rounded-2xl border border-[#c7c4d7] bg-white pl-12 pr-4 outline-none transition focus:border-[#4648d4] focus:ring-4 focus:ring-[#e1e0ff]"
            />
          </div>

          {status ? <p className="mb-6 rounded-xl border border-[#c7c4d7] bg-white p-4 text-sm font-semibold text-[#464554]">{status}</p> : null}

          {filteredStudents.length ? (
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((child) => (
                <StudentProfileCard
                  key={child.id}
                  child={child}
                  lastSession={sessions.find((session) => session.childId === child.id)}
                  onView={() => router.push(`/students/${child.id}`)}
                  onEdit={() => router.push(`/students/new?childId=${child.id}`)}
                  onRemove={async () => {
                    if (!confirm(`Remove ${child.fullName}?`)) return;
                    await deleteStudent(child.id);
                    await loadDashboard();
                  }}
                />
              ))}
            </section>
          ) : (
            <Card className="text-center">
              <UsersRound className="mx-auto h-10 w-10 text-[#767586]" />
              <h2 className="mt-4 text-xl font-semibold text-[#1b1b23]">No students yet</h2>
              <p className="mt-2 text-[#464554]">Create your first child profile to start logging sessions and reports.</p>
              <Link href="/students/new" className="mt-5 inline-block">
                <BrandButton>Create Child Profile</BrandButton>
              </Link>
            </Card>
          )}
        </div>
        <Footer />
      </main>
    </ProtectedContent>
  );
}
