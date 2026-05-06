"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, FilePlus2, UsersRound } from "lucide-react";
import { ProtectedContent } from "../../components/rise/AuthProvider";
import { BrandButton } from "../../components/rise/BrandButton";
import { Card } from "../../components/rise/Card";
import { Footer } from "../../components/rise/Footer";
import { TopNav } from "../../components/rise/TopNav";
import { listSessions, listStudents } from "../../lib/supabaseData";
import type { ChildProfile, SessionLog } from "../../types/rise";

function SessionsPageContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [students, setStudents] = useState<ChildProfile[]>([]);
  const [status, setStatus] = useState("Loading sessions...");

  useEffect(() => {
    async function load() {
      try {
        const [sessionData, studentData] = await Promise.all([listSessions(studentId || undefined), listStudents()]);
        setSessions(sessionData);
        setStudents(studentData);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load sessions.");
      }
    }

    load();
  }, [studentId]);

  return (
    <ProtectedContent>
      <main className="min-h-screen bg-[#fcf8ff]">
        <TopNav />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#1b1b23]">Sessions</h1>
              <p className="mt-2 text-lg text-[#464554]">Recent logged sessions across your students.</p>
            </div>
            <Link href="/students">
              <BrandButton variant="secondary">
                <UsersRound className="h-4 w-4" />
                View Students
              </BrandButton>
            </Link>
          </header>

          {status ? <p className="mb-6 rounded-xl border border-[#c7c4d7] bg-white p-4 text-sm font-semibold text-[#464554]">{status}</p> : null}

          {sessions.length ? (
            <section className="grid gap-4">
              {sessions.map((session) => {
                const student = students.find((item) => item.id === session.childId);
                return (
                  <Card key={session.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-[#1b1b23]">{session.topic}</h2>
                        <span className="rounded-full bg-[#e1e0ff] px-3 py-1 text-xs font-bold text-[#4648d4]">{student?.fullName || "Student"}</span>
                      </div>
                      <p className="mt-2 text-sm text-[#464554]">
                        {student?.yearGroup || "Year group not set"} · {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(session.sessionDate))}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#464554]">{session.quickNotes}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/students/${session.childId}`}>
                        <BrandButton variant="secondary">
                          <UsersRound className="h-4 w-4" />
                          View
                        </BrandButton>
                      </Link>
                      <Link href={`/sessions/new/${session.childId}?sessionId=${session.id}`}>
                        <BrandButton>
                          <FilePlus2 className="h-4 w-4" />
                          Log Session
                        </BrandButton>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </section>
          ) : (
            <Card className="text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-[#767586]" />
              <h2 className="mt-4 text-xl font-semibold text-[#1b1b23]">No sessions logged yet</h2>
              <p className="mt-2 text-[#464554]">Once you save a session, it will appear here for quick review.</p>
            </Card>
          )}
        </div>
        <Footer />
      </main>
    </ProtectedContent>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={null}>
      <SessionsPageContent />
    </Suspense>
  );
}
