"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Send, Trash2 } from "lucide-react";
import { ProtectedContent } from "../../../components/rise/AuthProvider";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Card } from "../../../components/rise/Card";
import { Footer } from "../../../components/rise/Footer";
import { ProgressSegments } from "../../../components/rise/ProgressSegments";
import { ReportSectionCard } from "../../../components/rise/ReportSectionCard";
import { TopNav } from "../../../components/rise/TopNav";
import { generateParentReport } from "../../../lib/reportGenerator";
import { deleteReport, getReportBundle } from "../../../lib/supabaseData";
import { initialsFromName } from "../../../lib/tutorKey";
import type { ChildProfile, ParentReport, SessionLog } from "../../../types/rise";

function priorityLabel(session?: SessionLog) {
  if (!session) return "Medium Priority";
  if (session.progressRating <= 2 || session.understandingToday === "lots-of-help") return "High Priority";
  if (session.progressRating >= 4) return "Low Priority";
  return "Medium Priority";
}

export default function ReportPage() {
  const params = useParams<{ reportId: string }>();
  const [data, setData] = useState<{ child: ChildProfile; session: SessionLog; report: ParentReport } | null>(null);
  const [status, setStatus] = useState("Loading report...");
  const [deleteText, setDeleteText] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    getReportBundle(params.reportId)
      .then((bundle) => {
        if (!bundle.session) {
          setStatus("No session found for this report.");
          return;
        }
        setData({
          child: bundle.child,
          session: bundle.session,
          report: bundle.parentReport ?? generateParentReport(bundle.child, bundle.session, bundle.sessions),
        });
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "Could not load report."));
  }, [params.reportId]);

  async function confirmDelete() {
    if (!data) return;
    try {
      await deleteReport(data.report.id);
      setStatus("Report deleted.");
      setDeleteOpen(false);
      window.location.href = "/reports";
    } catch (error) {
      setStatus(isDev && error instanceof Error ? error.message : "Could not delete report.");
    }
  }

  if (!data) {
    return (
      <ProtectedContent>
        <main className="min-h-screen bg-[#fcf8ff]">
          <TopNav />
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="rounded-xl border border-[#c7c4d7] bg-white p-4 text-sm font-semibold text-[#464554]">{status}</p>
          </div>
          <Footer />
        </main>
      </ProtectedContent>
    );
  }

  const { child, session, report } = data;
  const metadata = { child, session, report };
  const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(session.sessionDate));
  const progressSkillOne = Math.min(95, 45 + session.progressRating * 10);
  const progressSkillTwo = Math.min(95, 35 + session.confidenceRating * 9);
  const parentEmail = child.parentEmail;
  const subject = encodeURIComponent(`RISE Tutoring session report for ${child.fullName}`);
  const body = encodeURIComponent(
    [
      `Hi ${child.parentName},`,
      "",
      `Here is the session report for ${child.fullName} from ${date}.`,
      "",
      `Today&apos;s Focus: ${report.todayFocus}`,
      `Homework: ${report.homeworkAssigned}`,
      `Next Focus: ${report.nextSessionFocus}`,
      "",
      `Best,`,
      "Elena Dragan",
    ].join("\n")
  );

  return (
    <ProtectedContent>
      <main className="min-h-screen bg-[#fcf8ff]">
        <TopNav />
        <div className="report-print-root mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-semibold text-[#1b1b23]">Parent Session Report</h1>
            <p className="mt-2 text-lg text-[#464554]">Reviewing progress for {date} Session</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BrandButton variant="secondary" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              Download PDF
            </BrandButton>
            <BrandButton
              onClick={() => {
                // TODO: Replace with real parent delivery via email/Supabase automation.
                window.location.href = `mailto:${parentEmail}?subject=${subject}&body=${body}`;
              }}
            >
              <Send className="h-4 w-4" />
              Send to Parent
            </BrandButton>
            <BrandButton
              variant="secondary"
              onClick={() => {
                setDeleteText("");
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete report
            </BrandButton>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-12 print:gap-3 print-page-compact">
          <div className="md:col-span-8">
            <Card className="report-print-card flex flex-col items-center gap-5 md:flex-row md:text-left print:p-3">
              <div className="relative flex h-32 w-32 flex-none items-center justify-center rounded-2xl bg-[#e1e0ff] text-4xl font-black text-[#4648d4]">
                {initialsFromName(child.fullName)}
                <span className="absolute -bottom-2 -right-2 rounded-lg border-2 border-white bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] px-2 py-1 text-[10px] font-bold text-white">
                  RISE BADGE
                </span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-wide text-[#4648d4]">Student Profile</span>
                <h2 className="mt-1 text-3xl font-semibold">{child.fullName}</h2>
                <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                  <span className="rounded-full bg-[#e9e6f3] px-4 py-2 text-sm font-semibold text-[#464554]">
                    {child.subjects.join(" / ")} · {child.yearGroup}
                  </span>
                  <span className="rounded-full bg-[#f0dbff] px-4 py-2 text-sm font-semibold text-[#6900b3]">60 Min Session</span>
                </div>
              </div>
              <div className="w-full md:w-48">
                <p className="mb-2 text-sm font-semibold text-[#464554]">Overall Progress Indicator</p>
                <ProgressSegments value={session.progressRating} />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xl font-bold text-[#4648d4]">{session.progressRating}/5</span>
                  <span className="text-sm italic text-[#464554]">{report.progressSnapshot.progressLabel}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="md:col-span-4">
            <Card className="report-print-card h-full print:p-3">
              <h3 className="mb-3 text-xl font-semibold">Progress Snapshot</h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[#464554]">{session.keySkillWorkedOn}</span>
                    <span className="font-bold">{progressSkillOne}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#efecf8]">
                    <div className="h-full rounded-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)]" style={{ width: `${progressSkillOne}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[#464554]">{session.topic}</span>
                    <span className="font-bold">{progressSkillTwo}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#efecf8]">
                    <div className="h-full rounded-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)]" style={{ width: `${progressSkillTwo}%` }} />
                  </div>
                </div>
                <div className="border-t border-[#c7c4d7] pt-4 text-sm">
                  <div className="flex justify-between"><span className="text-[#767586]">Target Proficiency</span><b>{child.targetLevel}</b></div>
                  <div className="mt-2 flex justify-between"><span className="text-[#767586]">Current Standing</span><b>{child.currentWorkingLevel}</b></div>
                </div>
              </div>
            </Card>
          </div>

          <ReportSectionCard title="Today's Focus" icon="📚" className="report-print-card md:col-span-6 print:p-3">
            <p className="text-base leading-7 text-[#464554]">{report.todayFocus}</p>
          </ReportSectionCard>

          <ReportSectionCard title="What Went Well" icon="✅" className="report-print-card md:col-span-6 print:p-3">
            <ul className="space-y-2 text-base leading-7 text-[#464554]">
              {report.whatWentWell.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </ReportSectionCard>

          <ReportSectionCard title="Still Needs Support" icon="⚠️" className="report-print-card md:col-span-4 print:p-3">
            <p className="mb-4 text-sm leading-6 text-[#464554]">{report.stillNeedsSupport}</p>
            <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-bold text-[#93000a]">{priorityLabel(session)}</span>
          </ReportSectionCard>

          <ReportSectionCard title="Confidence" icon="🧠" className="report-print-card md:col-span-4 print:p-3">
            <ProgressSegments value={session.confidenceRating} />
            <p className="mt-4 text-sm leading-6 text-[#464554]">{report.confidenceUnderstanding}</p>
          </ReportSectionCard>

          <ReportSectionCard title="Homework" icon="📝" className="report-print-card md:col-span-4 print:p-3">
            <p className="text-sm leading-6 text-[#464554]">{report.homeworkAssigned}</p>
          </ReportSectionCard>

          <section className="report-print-card rounded-3xl bg-[#6063ee] p-6 text-white shadow-lg md:col-span-4 print:p-3">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-xl font-semibold">Next Focus</h3>
            </div>
            <p className="leading-7 text-white/90">{report.nextSessionFocus}</p>
            <p className="mt-5 text-sm text-white/80">Next session: to be scheduled</p>
          </section>

          <ReportSectionCard title="Tutor Summary" icon="💬" className="report-print-card md:col-span-8 print:p-3">
            <p className="text-lg italic leading-8 text-[#1b1b23]">"{report.tutorSummary}"</p>
            <div className="mt-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] font-bold text-white">ED</div>
              <div>
                <p className="font-bold text-[#1b1b23]">Elena Dragan</p>
                <p className="text-sm text-[#464554]">Senior Mathematics Lead</p>
              </div>
            </div>
          </ReportSectionCard>
        </section>

        <details className="mt-10 rounded-2xl border border-[#c7c4d7] bg-[#efecf8] p-5 print:hidden">
          <summary className="cursor-pointer font-semibold text-[#464554]">View Report Metadata (JSON)</summary>
          <pre className="mt-5 max-h-96 overflow-auto rounded-lg bg-[#303038] p-4 text-xs leading-6 text-[#f2effb]">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </details>
        {deleteOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
            <div className="w-full max-w-lg rounded-3xl border border-[#c7c4d7] bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-[#1b1b23]">Delete report</h3>
              <p className="mt-2 text-sm leading-6 text-[#464554]">This will permanently delete this report from RISE Dashboard.</p>
              <p className="mt-3 rounded-2xl border border-[#ffdad6] bg-[#fff5f4] p-4 text-sm font-semibold text-[#93000a]">Type DELETE to confirm.</p>
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
                    setDeleteOpen(false);
                    setDeleteText("");
                  }}
                >
                  Cancel
                </BrandButton>
                <BrandButton onClick={() => (deleteText.trim() === "DELETE" ? confirmDelete() : setStatus("Please type DELETE to confirm."))}>
                  Confirm Delete
                </BrandButton>
              </div>
            </div>
          </div>
        ) : null}
        </div>
        <div className="print:hidden">
          <Footer />
        </div>
      </main>
    </ProtectedContent>
  );
}
