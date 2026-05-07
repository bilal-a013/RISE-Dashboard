"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, Inbox, KeyRound, Mail, RefreshCw, Search } from "lucide-react";
import { ProtectedContent } from "../../components/rise/AuthProvider";
import { BrandButton } from "../../components/rise/BrandButton";
import { Card } from "../../components/rise/Card";
import { Footer } from "../../components/rise/Footer";
import { useToast } from "../../components/rise/ToastProvider";
import { TopNav } from "../../components/rise/TopNav";
import { deleteReport, findStudentByTutorKey, listReports } from "../../lib/supabaseData";
import type { ChildProfile, ReportRow } from "../../types/rise";

type ReportWithRelations = ReportRow & {
  students?: { full_name?: string; parent_email?: string };
  sessions?: { subject?: string; topic?: string; session_date?: string };
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [key, setKey] = useState("");
  const [student, setStudent] = useState<ChildProfile | null>(null);
  const [status, setStatus] = useState("Loading reports...");
  const [deleteTarget, setDeleteTarget] = useState<ReportWithRelations | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const { toast } = useToast();
  const isDev = process.env.NODE_ENV !== "production";

  async function loadReports() {
    try {
      setReports(await listReports());
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load reports.");
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function searchKey() {
    try {
      const found = await findStudentByTutorKey(key);
      setStudent(found);
      setStatus(found ? "" : "No student found for that Tutor Key.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not search Tutor Key.");
    }
  }

  async function confirmDelete(report: ReportWithRelations) {
    try {
      await deleteReport(report.id);
      setStatus("Report deleted.");
      toast({ title: "Report deleted", description: `${report.title} was removed from RISE Dashboard.`, variant: "success" });
      setDeleteTarget(null);
      setDeleteText("");
      await loadReports();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete report.";
      setStatus(isDev ? message : "Could not delete report.");
      toast({ title: "Could not delete report", description: isDev ? message : "Please try again.", variant: "error" });
    }
  }

  return (
    <ProtectedContent>
      <main className="rise-page min-h-screen animate-rise-page">
        <TopNav />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold text-[var(--rise-heading)]">Reports</h1>
            <p className="mt-2 text-lg text-[var(--rise-text-muted)]">Review parent reports and quickly load a student by Tutor Key.</p>
          </header>

          <section className="mb-8 grid gap-6 lg:grid-cols-12">
            <Card className="space-y-4 lg:col-span-7">
              <div className="flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-[#4648d4]" />
                <h2 className="text-xl font-semibold text-[#1b1b23]">Tutor Key Search</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={key}
                  onChange={(event) => setKey(event.target.value.toUpperCase())}
                  placeholder="RISE-AK47"
                  className="h-12 flex-1 rounded-2xl border border-[#c7c4d7] bg-white px-4 font-mono font-bold tracking-widest text-[#4648d4] outline-none transition focus:border-[#4648d4] focus:ring-4 focus:ring-[#e1e0ff]"
                />
                <BrandButton onClick={searchKey}>
                  <Search className="h-4 w-4" />
                  Search
                </BrandButton>
              </div>
              {student ? (
                <div className="rounded-xl border border-[#e9e6f3] bg-[#f5f2fe] p-4">
                  <p className="font-semibold text-[#1b1b23]">{student.fullName}</p>
                  <p className="mt-1 text-sm text-[#464554]">{student.subjects.join(", ")} / {student.parentEmail}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/students/${student.id}`}>
                      <BrandButton variant="secondary">View Profile</BrandButton>
                    </Link>
                    <Link href={`/sessions/new/${student.id}`}>
                      <BrandButton variant="secondary">Log Session</BrandButton>
                    </Link>
                  </div>
                </div>
              ) : null}
            </Card>

            <Card className="lg:col-span-5">
              <div className="flex items-start gap-3">
                <Inbox className="mt-1 h-5 w-5 text-[#8127cf]" />
                <div>
                  <h2 className="text-xl font-semibold text-[#1b1b23]">Parent Replies</h2>
                  <p className="mt-2 text-sm leading-6 text-[#464554]">Email reply integration coming soon.</p>
                </div>
              </div>
            </Card>
          </section>

          {status ? <p className="mb-6 rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4 text-sm font-semibold text-[var(--rise-text-muted)]">{status}</p> : null}

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-[#1b1b23]">Recent Reports</h2>
              <BrandButton variant="secondary" onClick={loadReports}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </BrandButton>
            </div>

            {reports.length ? (
              <div className="grid gap-4">
                {reports.map((report) => {
                  const date = report.sessions?.session_date || report.created_at || "";
                  return (
                    <Card key={report.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-[#1b1b23]">{report.students?.full_name || "Student"}</h3>
                          <span className="rounded-full bg-[#e1e0ff] px-3 py-1 text-xs font-bold text-[#4648d4]">{report.sent_status || "draft"}</span>
                        </div>
                        <p className="mt-2 text-sm text-[#464554]">{report.sessions?.subject || "Session"} / {report.sessions?.topic || report.title}</p>
                        <p className="mt-1 text-sm text-[#464554]">{date ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(date)) : "No date"} / {report.sent_to || report.students?.parent_email || "No parent email"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/reports/${report.id}`}>
                          <BrandButton variant="secondary">
                            <Eye className="h-4 w-4" />
                            View
                          </BrandButton>
                        </Link>
                        <Link href={`/reports/${report.id}/edit`}>
                          <BrandButton variant="secondary">
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </BrandButton>
                        </Link>
                        <Link href={`/reports/${report.id}`}>
                          <BrandButton>
                            <Mail className="h-4 w-4" />
                            {report.sent_status === "sent" ? "Resend" : "Send"}
                          </BrandButton>
                        </Link>
                        <BrandButton
                          variant="secondary"
                          onClick={() => {
                            setDeleteTarget(report);
                            setDeleteText("");
                          }}
                        >
                          Delete
                        </BrandButton>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center">
                <Mail className="mx-auto h-10 w-10 text-[var(--rise-text-soft)]" />
                <h2 className="mt-4 text-xl font-semibold text-[var(--rise-heading)]">No reports yet</h2>
                <p className="mt-2 text-[var(--rise-text-muted)]">Generate a parent report from a saved session and it will appear here.</p>
              </Card>
            )}
          </section>

          {deleteTarget ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg rounded-3xl border border-[#c7c4d7] bg-white p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-[#1b1b23]">Delete report</h3>
                <p className="mt-2 text-sm leading-6 text-[#464554]">
                  This will permanently delete this report from RISE Dashboard.
                </p>
                <p className="mt-3 rounded-2xl border border-[#ffdad6] bg-[#fff5f4] p-4 text-sm font-semibold text-[#93000a]">
                  Type DELETE to confirm.
                </p>
                <input
                  value={deleteText}
                  onChange={(event) => setDeleteText(event.target.value)}
                  placeholder="DELETE"
                  className="mt-4 h-12 w-full rounded-2xl border border-[#c7c4d7] bg-white px-4 outline-none transition focus:border-[#4648d4] focus:ring-4 focus:ring-[#e1e0ff]"
                />
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <BrandButton
                    variant="secondary"
                    onClick={() => {
                      setDeleteTarget(null);
                      setDeleteText("");
                    }}
                  >
                    Cancel
                  </BrandButton>
                  <BrandButton
                    disabled={deleteText.trim() !== "DELETE"}
                    onClick={() => confirmDelete(deleteTarget)}
                  >
                    Confirm Delete
                  </BrandButton>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <Footer />
      </main>
    </ProtectedContent>
  );
}
