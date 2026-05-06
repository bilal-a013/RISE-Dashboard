"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, FilePlus2, Pencil, Plus, UsersRound } from "lucide-react";
import { ProtectedContent } from "../../components/rise/AuthProvider";
import { BrandButton } from "../../components/rise/BrandButton";
import { Card } from "../../components/rise/Card";
import { Footer } from "../../components/rise/Footer";
import { TopNav } from "../../components/rise/TopNav";
import { listSessions, listStudents } from "../../lib/supabaseData";
import type { ChildProfile, SessionLog } from "../../types/rise";

function StudentsPageContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<ChildProfile[]>([]);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [status, setStatus] = useState("Loading students...");
  const saved = searchParams.get("saved") === "1";
  const filter = searchParams.get("filter");

  useEffect(() => {
    async function load() {
      try {
        const [studentData, sessionData] = await Promise.all([listStudents(), listSessions()]);
        setStudents(studentData);
        setSessions(sessionData);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load students.");
      }
    }

    load();
  }, []);

  const visibleStudents =
    filter === "attention"
      ? students.filter((student) => {
          const studentSessions = sessions.filter((session) => session.childId === student.id);
          if (!studentSessions.length) return true;
          const latest = studentSessions[0];
          return latest.understandingToday === "lots-of-help" || latest.progressRating <= 2 || !latest.quickNotes.trim();
        })
      : students;

  return (
    <ProtectedContent>
      <main className="min-h-screen bg-[#fcf8ff]">
        <TopNav />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#1b1b23]">Students</h1>
              <p className="mt-2 text-lg text-[#464554]">Manage saved tutoring profiles.</p>
            </div>
            <Link href="/students/new">
              <BrandButton>
                <Plus className="h-4 w-4" />
                Create Child Profile
              </BrandButton>
            </Link>
          </header>

          {saved ? <p className="mb-6 rounded-xl border border-[#c7c4d7] bg-[#f5f2fe] p-4 text-sm font-semibold text-[#4648d4]">Profile saved successfully.</p> : null}
          {status ? <p className="mb-6 rounded-xl border border-[#c7c4d7] bg-white p-4 text-sm font-semibold text-[#464554]">{status}</p> : null}

          {filter === "attention" ? (
            <p className="mb-6 rounded-xl border border-[#e9e6f3] bg-[#f5f2fe] p-4 text-sm font-semibold text-[#4648d4]">
              Showing students who may need attention.
            </p>
          ) : null}

          {visibleStudents.length ? (
            <section className="grid gap-5">
              {visibleStudents.map((student) => {
                const lastSession = sessions.find((session) => session.childId === student.id);
                return (
                  <Card key={student.id} className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-[#1b1b23]">{student.fullName}</h2>
                        <span className="rounded-full bg-[#e1e0ff] px-3 py-1 text-xs font-bold text-[#4648d4]">{student.status || "active"}</span>
                        <span className="rounded-full border border-[#c7c4d7] bg-white px-3 py-1 text-xs font-mono font-bold tracking-widest text-[#4648d4]">{student.tutorKey}</span>
                      </div>
                      <p className="text-sm text-[#464554]">{student.yearGroup} / {student.subjects.join(", ") || "No subjects set"}</p>
                      <p className="mt-2 text-sm font-semibold text-[#4648d4]">{student.currentWorkingLevel} {"->"} {student.targetLevel}</p>
                      <p className="mt-3 inline-flex rounded-xl border border-[#e9e6f3] bg-[#f5f2fe] px-3 py-2 text-sm font-semibold text-[#464554]">
                        Last session: {lastSession ? `${lastSession.topic} on ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(lastSession.sessionDate))}` : "No sessions yet"}
                      </p>
                    </div>
                    <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[18rem] lg:grid-cols-2">
                      <Link href={`/students/${student.id}`}>
                        <BrandButton variant="secondary" className="w-full">
                          <Eye className="h-4 w-4" />
                          View
                        </BrandButton>
                      </Link>
                      <Link href={`/students/new?childId=${student.id}`}>
                        <BrandButton variant="secondary" className="w-full">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </BrandButton>
                      </Link>
                      <Link href={`/sessions/new/${student.id}`}>
                        <BrandButton className="w-full">
                          <FilePlus2 className="h-4 w-4" />
                          Log Session
                        </BrandButton>
                      </Link>
                      <Link href={`/students/${student.id}`}>
                        <BrandButton variant="secondary" className="w-full">
                          <UsersRound className="h-4 w-4" />
                          Overview
                        </BrandButton>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </section>
          ) : (
            <Card className="text-center">
              <UsersRound className="mx-auto h-10 w-10 text-[#767586]" />
              <h2 className="mt-4 text-xl font-semibold text-[#1b1b23]">No saved students</h2>
              <p className="mt-2 text-[#464554]">Create a child profile once, then every session and report can link back to it.</p>
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

export default function StudentsPage() {
  return (
    <Suspense fallback={null}>
      <StudentsPageContent />
    </Suspense>
  );
}
