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

        <section className="grid gap-6 md:grid-cols-12 print:gap-2 print-page-compact">
          <div className="md:col-span-8">
            <Card className="report-print-card flex flex-col items-center gap-5 md:flex-row md:text-left print:p-2">
              <div className="relative flex h-24 w-24 flex-none items-center justify-center rounded-2xl bg-[#e1e0ff] text-3xl font-black text-[#4648d4] print:h-20 print:w-20 print:text-2xl">
                {initialsFromName(child.fullName)}
                <span className="absolute -bottom-2 -right-2 rounded-lg border-2 border-white bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] px-2 py-1 text-[10px] font-bold text-white">
                  RISE BADGE
                </span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-wide text-[#4648d4]">Student Profile</span>
                <h2 className="mt-1 text-3xl font-semibold print:mt-0 print:text-[18px]">{child.fullName}</h2>
                <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start print:mt-2 print:gap-1.5">
                  <span className="rounded-full bg-[#e9e6f3] px-4 py-2 text-sm font-semibold text-[#464554] print:px-3 print:py-1 print:text-[10px]">
                    {child.subjects.join(" / ")} · {child.yearGroup}
                  </span>
                  <span className="rounded-full bg-[#f0dbff] px-4 py-2 text-sm font-semibold text-[#6900b3] print:px-3 print:py-1 print:text-[10px]">60 Min Session</span>
                </div>
              </div>
              <div className="w-full md:w-48">
                <p className="mb-2 text-sm font-semibold text-[#464554] print:mb-1 print:text-[10px]">Overall Progress Indicator</p>
                <ProgressSegments value={session.progressRating} />
                <div className="mt-2 flex items-center justify-between print:mt-1">
                  <span className="text-xl font-bold text-[#4648d4] print:text-[14px]">{session.progressRating}/5</span>
                  <span className="text-sm italic text-[#464554] print:text-[10px]">{report.progressSnapshot.progressLabel}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="md:col-span-4">
            <Card className="report-print-card h-full print:p-2">
              <h3 className="mb-2 text-xl font-semibold print:mb-1 print:text-[12px]">Progress Snapshot</h3>
              <div className="space-y-3">
                <div>
                  <div className="mb-1.5 flex justify-between text-sm print:mb-1 print:text-[10px]">
                    <span className="text-[#464554]">{session.keySkillWorkedOn}</span>
                    <span className="font-bold">{progressSkillOne}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#efecf8] print:h-1">
                    <div className="h-full rounded-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)]" style={{ width: `${progressSkillOne}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-sm print:mb-1 print:text-[10px]">
                    <span className="text-[#464554]">{session.topic}</span>
                    <span className="font-bold">{progressSkillTwo}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#efecf8] print:h-1">
                    <div className="h-full rounded-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)]" style={{ width: `${progressSkillTwo}%` }} />
                  </div>
                </div>
                <div className="border-t border-[#c7c4d7] pt-3 text-sm print:pt-2 print:text-[10px]">
                  <div className="flex justify-between"><span className="text-[#767586]">Target Proficiency</span><b>{child.targetLevel}</b></div>
                  <div className="mt-2 flex justify-between"><span className="text-[#767586]">Current Standing</span><b>{child.currentWorkingLevel}</b></div>
                </div>
              </div>
            </Card>
          </div>

          <ReportSectionCard title="Today's Focus" icon="📚" className="report-print-card md:col-span-6 print:p-2">
            <p className="text-sm leading-6 text-[#464554] print:text-[10px]">{report.todayFocus}</p>
          </ReportSectionCard>

          <ReportSectionCard title="What Went Well" icon="✅" className="report-print-card md:col-span-6 print:p-2">
            <ul className="space-y-1.5 text-sm leading-6 text-[#464554] print:text-[10px]">
              {report.whatWentWell.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </ReportSectionCard>

          <ReportSectionCard title="Still Needs Support" icon="⚠️" className="report-print-card md:col-span-4 print:p-2">
            <p className="mb-3 text-sm leading-6 text-[#464554] print:mb-2 print:text-[10px]">{report.stillNeedsSupport}</p>
            <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-bold text-[#93000a] print:px-2 print:py-0.5 print:text-[9px]">{priorityLabel(session)}</span>
          </ReportSectionCard>

          <ReportSectionCard title="Confidence" icon="🧠" className="report-print-card md:col-span-4 print:p-2">
            <ProgressSegments value={session.confidenceRating} />
            <p className="mt-3 text-sm leading-6 text-[#464554] print:mt-2 print:text-[10px]">{report.confidenceUnderstanding}</p>
          </ReportSectionCard>

          <ReportSectionCard title="Homework" icon="📝" className="report-print-card md:col-span-4 print:p-2">
            <p className="text-sm leading-6 text-[#464554] print:text-[10px]">{report.homeworkAssigned}</p>
          </ReportSectionCard>

          <section className="report-print-card rounded-3xl bg-[#6063ee] p-6 text-white shadow-lg md:col-span-4 print:p-2">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl print:text-lg">🎯</span>
              <h3 className="text-xl font-semibold print:text-[12px]">Next Focus</h3>
            </div>
            <p className="leading-7 text-white/90 print:text-[10px]">{report.nextSessionFocus}</p>
            <p className="mt-4 text-sm text-white/80 print:mt-2 print:text-[9px]">Next session: to be scheduled</p>
          </section>

          <ReportSectionCard title="Tutor Summary" icon="💬" className="report-print-card md:col-span-8 print:p-2">
            <p className="text-base italic leading-7 text-[#1b1b23] print:text-[10px]">"{report.tutorSummary}"</p>
            <div className="mt-5 flex items-center gap-3 print:mt-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] font-bold text-white print:h-8 print:w-8">
                ED
              </div>
              <div>
                <p className="font-bold text-[#1b1b23] print:text-[10px]">Elena Dragan</p>
                <p className="text-sm text-[#464554] print:text-[9px]">Senior Mathematics Lead</p>
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
                <BrandButton
                  disabled={deleteText.trim() !== "DELETE"}
                  onClick={() => confirmDelete()}
                >
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
