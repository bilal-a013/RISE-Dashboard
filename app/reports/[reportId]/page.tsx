"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Copy, Download, ExternalLink, Mail, Save, Send, Trash2 } from "lucide-react";
import { ProtectedContent } from "../../../components/rise/AuthProvider";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Card } from "../../../components/rise/Card";
import { Footer } from "../../../components/rise/Footer";
import { ProgressSegments } from "../../../components/rise/ProgressSegments";
import { ReportSectionCard } from "../../../components/rise/ReportSectionCard";
import { TopNav } from "../../../components/rise/TopNav";
import { useToast } from "../../../components/rise/ToastProvider";
import { generateParentReport } from "../../../lib/reportGenerator";
import { deleteReport, getReportBundle, markReportSent } from "../../../lib/supabaseData";
import { initialsFromName } from "../../../lib/tutorKey";
import type { ChildProfile, ParentReport, SessionLog } from "../../../types/rise";

function priorityLabel(session?: SessionLog) {
  if (!session) return "Medium Priority";
  if (session.progressRating <= 2 || session.understandingToday === "lots-of-help") return "High Priority";
  if (session.progressRating >= 4) return "Low Priority";
  return "Medium Priority";
}

function buildPlainEmail(child: ChildProfile, session: SessionLog, report: ParentReport, reportDate: string) {
  return [
    `Hi ${child.parentName},`,
    "",
    `Here is ${child.fullName}'s latest tutoring update from today's session (${reportDate}).`,
    "",
    `Today's Focus: ${report.todayFocus}`,
    `What Went Well: ${report.whatWentWell.join(" • ")}`,
    `Still Needs Support: ${report.stillNeedsSupport}`,
    `Confidence: ${report.confidenceUnderstanding}`,
    `Homework: ${report.homeworkAssigned}`,
    `Next Focus: ${report.nextSessionFocus}`,
    `Progress Snapshot: ${report.progressSnapshot.progressLabel} (${session.progressRating}/5)`,
    "",
    `${report.tutorSummary}`,
    "",
    `Kind regards,`,
    "RISE Tutoring",
  ].join("\n");
}

function buildStyledEmail(child: ChildProfile, session: SessionLog, report: ParentReport, reportDate: string) {
  const cards = [
    ["Today's Focus", report.todayFocus],
    ["What Went Well", report.whatWentWell.join(" • ")],
    ["Still Needs Support", report.stillNeedsSupport],
    ["Confidence", report.confidenceUnderstanding],
    ["Homework", report.homeworkAssigned],
    ["Next Focus", report.nextSessionFocus],
  ];

  return `<!doctype html>
  <html>
    <body style="margin:0; padding:0; background:#fcf8ff; font-family:Arial,Helvetica,sans-serif; color:#1b1b23;">
      <div style="max-width:640px; margin:0 auto; padding:18px 12px;">
        <div style="background:#ffffff; border:1px solid #c7c4d7; border-radius:24px; overflow:hidden; box-shadow:0 10px 30px rgba(70,72,212,.08);">
          <div style="background:linear-gradient(135deg,#4648d4 0%,#8127cf 100%); color:#ffffff; padding:22px 24px;">
            <div style="font-size:11px; letter-spacing:.18em; text-transform:uppercase; opacity:.82;">RISE Tutoring</div>
            <div style="font-size:24px; font-weight:700; line-height:1.2; margin-top:6px;">${child.fullName}</div>
            <div style="font-size:14px; opacity:.9; margin-top:6px;">${reportDate} · ${session.topic}</div>
          </div>
          <div style="padding:22px 24px;">
            <p style="margin:0 0 14px; font-size:15px; line-height:1.6;">Hi ${child.parentName},</p>
            <p style="margin:0 0 18px; font-size:15px; line-height:1.6;">Here is ${child.fullName}'s latest tutoring update from today's session.</p>
            <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:18px;">
              <div style="border:1px solid #e9e6f3; background:#f5f2fe; border-radius:999px; padding:8px 12px; font-size:12px; font-weight:700; color:#4648d4;">${child.subjects.join(' / ')}</div>
              <div style="border:1px solid #e9e6f3; background:#f5f2fe; border-radius:999px; padding:8px 12px; font-size:12px; font-weight:700; color:#4648d4;">${child.currentWorkingLevel} → ${child.targetLevel}</div>
              <div style="border:1px solid #e9e6f3; background:#f5f2fe; border-radius:999px; padding:8px 12px; font-size:12px; font-weight:700; color:#4648d4;">${report.progressSnapshot.progressLabel}</div>
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0 10px; margin-bottom:16px;">
              <tr>
                <td style="width:50%; padding-right:5px; vertical-align:top;">
                  <div style="border:1px solid #e9e6f3; background:#f5f2fe; border-radius:18px; padding:12px 14px;">
                    <div style="font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#4648d4; font-weight:700; margin-bottom:6px;">Progress Snapshot</div>
                    <div style="font-size:14px; line-height:1.5; color:#1b1b23;">${report.progressSnapshot.progressLabel} · ${report.progressSnapshot.confidenceLabel} confidence</div>
                  </div>
                </td>
                <td style="width:50%; padding-left:5px; vertical-align:top;">
                  <div style="border:1px solid #e9e6f3; background:#f5f2fe; border-radius:18px; padding:12px 14px;">
                    <div style="font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#4648d4; font-weight:700; margin-bottom:6px;">Current & Target</div>
                    <div style="font-size:14px; line-height:1.5; color:#1b1b23;">${child.currentWorkingLevel} → ${child.targetLevel}</div>
                  </div>
                </td>
              </tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0 10px;">
              ${cards
                .map(
                  ([label, value], index) => `
                    <tr>
                      <td style="width:${index < 2 ? "50%" : "100%"}; padding:${index < 2 ? (index % 2 === 0 ? "0 5px 0 0" : "0 0 0 5px") : "0"};${index >= 2 ? " vertical-align:top;" : ""}">
                        <div style="border:1px solid #e9e6f3; background:#ffffff; border-radius:18px; padding:12px 14px;">
                          <div style="font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#4648d4; font-weight:700; margin-bottom:6px;">${label}</div>
                          <div style="font-size:14px; line-height:1.5; color:#1b1b23;">${String(value)}</div>
                        </div>
                      </td>
                    </tr>
                  `
                )
                .join("")}
            </table>
            <div style="margin-top:14px; border-left:4px solid #4648d4; background:#fcf8ff; padding:12px 14px; border-radius:14px;">
              <div style="font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#4648d4; font-weight:700; margin-bottom:6px;">Tutor Summary</div>
              <div style="font-size:14px; line-height:1.6; color:#1b1b23;">${report.tutorSummary}</div>
            </div>
            <p style="margin:18px 0 0; font-size:14px; line-height:1.6;">Kind regards,<br/><strong>RISE Tutoring</strong></p>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

export default function ReportPage() {
  const params = useParams<{ reportId: string }>();
  const reportId = Array.isArray(params.reportId) ? params.reportId[0] : params.reportId;
  const [data, setData] = useState<{ child: ChildProfile; session: SessionLog; report: ParentReport } | null>(null);
  const [status, setStatus] = useState("Loading report...");
  const [deleteText, setDeleteText] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const { toast } = useToast();
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    setData(null);
    setDeleteOpen(false);
    setDeleteText("");
    setSendOpen(false);
    setCopyStatus("");
    setStatus("Loading report...");
    if (!reportId) return;
    getReportBundle(reportId)
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
  }, [reportId]);

  const reportEmail = data?.child.parentEmail || "";
  const reportDate = data ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(data.session.sessionDate)) : "";
  const emailSubject = data ? `RISE Tutoring Report - ${data.child.fullName} - ${reportDate}` : "";
  const emailText = data ? buildPlainEmail(data.child, data.session, data.report, reportDate) : "";
  const emailHtml = data ? buildStyledEmail(data.child, data.session, data.report, reportDate) : "";
  const emailCards = data
    ? [
        { label: "Today's Focus", value: data.report.todayFocus, span: "md:col-span-2" },
        { label: "What Went Well", value: data.report.whatWentWell.join(" • "), span: "md:col-span-2" },
        { label: "Still Needs Support", value: data.report.stillNeedsSupport, span: "md:col-span-2" },
        { label: "Confidence", value: data.report.confidenceUnderstanding, span: "md:col-span-1" },
        { label: "Homework", value: data.report.homeworkAssigned, span: "md:col-span-1" },
        { label: "Next Focus", value: data.report.nextSessionFocus, span: "md:col-span-2" },
      ]
    : [];

  async function confirmDelete() {
    if (!reportId) return;
    try {
      const deletedTitle = data?.report.title ?? "Report";
      await deleteReport(reportId);
      setStatus("Report deleted.");
      toast({ title: "Report deleted", description: `${deletedTitle} was removed from Supabase.`, variant: "success" });
      setDeleteOpen(false);
      window.location.href = "/reports";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete report.";
      setStatus(isDev ? message : "Could not delete report.");
      toast({ title: "Could not delete report", description: isDev ? message : "Please try again.", variant: "error" });
    }
  }

  async function markAsSent() {
    if (!data) return;
    try {
      const updated = await markReportSent(data.report.id, data.child.parentEmail || null);
      void updated;
      setStatus("Marked as sent.");
      toast({ title: "Report marked as sent", description: "The report status was updated in Supabase.", variant: "success" });
      setSendOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update sent status.";
      setStatus(isDev ? message : "Could not update sent status.");
      toast({ title: "Could not update sent status", description: isDev ? message : "Please try again.", variant: "error" });
    }
  }

  async function copyEmail() {
    try {
      if (navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([emailText], { type: "text/plain" }),
            "text/html": new Blob([emailHtml], { type: "text/html" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(emailHtml);
      }
      setCopyStatus("Email copied.");
      toast({ title: "Styled email copied", description: "Paste it into Gmail for best formatting.", variant: "success" });
    } catch {
      setCopyStatus("Could not copy email.");
      toast({ title: "Could not copy email", description: "Try again or copy the plain text version.", variant: "error" });
    }
  }

  if (!data) {
    return (
      <ProtectedContent>
        <main className="rise-page min-h-screen">
          <TopNav />
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4 text-sm font-semibold text-[var(--rise-text-muted)]">{status}</p>
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
  const emailPreviewStyle = {
    fontFamily: "Arial, Helvetica, sans-serif",
    background: "#fcf8ff",
    color: "#1b1b23",
  } as const;

  return (
    <ProtectedContent>
      <main className="rise-page min-h-screen animate-rise-page">
        <TopNav />
        <div className="report-print-root mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--rise-heading)]">Parent Session Report</h1>
            <p className="mt-2 text-lg text-[var(--rise-text-muted)]">Reviewing progress for {date} Session</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BrandButton variant="secondary" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              Download PDF
            </BrandButton>
            <BrandButton
              onClick={() => {
                setSendOpen(true);
              }}
            >
              <Send className="h-4 w-4" />
              Send to Parent
            </BrandButton>
            <Link href={`/reports/${params.reportId}/edit`}>
              <BrandButton variant="secondary">
                <Save className="h-4 w-4" />
                Edit Report
              </BrandButton>
            </Link>
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

        <section className="grid gap-6 md:grid-cols-12 print:gap-2 print-page-compact print-grid">
          <div className="md:col-span-8 print:col-span-2">
            <Card className="report-print-card flex flex-col items-center gap-5 md:flex-row md:text-left print:p-2">
              <div className="relative flex h-24 w-24 flex-none items-center justify-center rounded-2xl bg-[#e1e0ff] text-3xl font-black text-[#4648d4] print:hidden">
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
              <div className="w-full md:w-48 print:hidden">
                <p className="mb-2 text-sm font-semibold text-[#464554] print:mb-1 print:text-[10px]">Overall Progress Indicator</p>
                <ProgressSegments value={session.progressRating} />
                <div className="mt-2 flex items-center justify-between print:mt-1">
                  <span className="text-xl font-bold text-[#4648d4] print:text-[14px]">{session.progressRating}/5</span>
                  <span className="text-sm italic text-[#464554] print:text-[10px]">{report.progressSnapshot.progressLabel}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="md:col-span-4 print:col-span-2">
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

          <ReportSectionCard title="Today's Focus" icon="📚" className="report-print-card md:col-span-6 print:col-span-1 print:p-2">
            <p className="text-sm leading-6 text-[#464554] print:text-[10px]">{report.todayFocus}</p>
          </ReportSectionCard>

          <ReportSectionCard title="What Went Well" icon="✅" className="report-print-card md:col-span-6 print:col-span-1 print:p-2">
            <ul className="space-y-1.5 text-sm leading-6 text-[#464554] print:text-[10px]">
              {report.whatWentWell.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </ReportSectionCard>

          <ReportSectionCard title="Still Needs Support" icon="⚠️" className="report-print-card md:col-span-4 print:col-span-1 print:p-2">
            <p className="mb-3 text-sm leading-6 text-[#464554] print:mb-2 print:text-[10px]">{report.stillNeedsSupport}</p>
            <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-bold text-[#93000a] print:px-2 print:py-0.5 print:text-[9px]">{priorityLabel(session)}</span>
          </ReportSectionCard>

          <ReportSectionCard title="Confidence" icon="🧠" className="report-print-card md:col-span-4 print:col-span-1 print:p-2">
            <ProgressSegments value={session.confidenceRating} />
            <p className="mt-3 text-sm leading-6 text-[#464554] print:mt-2 print:text-[10px]">{report.confidenceUnderstanding}</p>
          </ReportSectionCard>

          <ReportSectionCard title="Homework" icon="📝" className="report-print-card md:col-span-4 print:col-span-1 print:p-2">
            <p className="text-sm leading-6 text-[#464554] print:text-[10px]">{report.homeworkAssigned}</p>
          </ReportSectionCard>

          <section className="report-print-card rounded-3xl bg-[#6063ee] p-6 text-white shadow-lg md:col-span-4 print:col-span-1 print:p-2">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl print:text-lg">🎯</span>
              <h3 className="text-xl font-semibold print:text-[12px]">Next Focus</h3>
            </div>
            <p className="leading-7 text-white/90 print:text-[10px]">{report.nextSessionFocus}</p>
            <p className="mt-4 text-sm text-white/80 print:mt-2 print:text-[9px]">Next session: to be scheduled</p>
          </section>

          <ReportSectionCard title="Tutor Summary" icon="💬" className="report-print-card md:col-span-8 print:col-span-2 print:p-2">
            <p className="text-base italic leading-7 text-[#1b1b23] print:text-[10px]">"{report.tutorSummary}"</p>
            <div className="report-tutor-block mt-5 flex items-center gap-3 print:hidden">
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

        {sendOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4 print:hidden">
            <div className="flex max-h-[85vh] w-full max-w-[980px] flex-col overflow-hidden rounded-3xl border border-[var(--rise-border)] bg-[var(--rise-surface)] shadow-2xl">
              <div className="flex flex-none items-center justify-between border-b border-[var(--rise-border)] bg-[var(--rise-surface-soft)] px-4 py-3 sm:px-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--rise-heading)] sm:text-xl">Send to Parent</h3>
                  <p className="text-sm text-[var(--rise-text-muted)]">Preview the email, download the PDF, then send or mark as sent.</p>
                </div>
                <BrandButton
                  variant="secondary"
                  onClick={() => {
                    setSendOpen(false);
                    setCopyStatus("");
                  }}
                  >
                  Close
                </BrandButton>
              </div>
              <div className="grid min-h-0 gap-4 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="min-h-0 space-y-4">
                  <Card className="space-y-3 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--rise-purple)]">Email draft</p>
                        <h4 className="max-w-full break-words text-base font-semibold text-[var(--rise-heading)] sm:text-lg">{emailSubject}</h4>
                      </div>
                      <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <BrandButton variant="secondary" onClick={copyEmail}>
                          <Copy className="h-4 w-4" />
                          Copy styled email
                        </BrandButton>
                        <BrandButton variant="secondary" onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(emailText);
                            setCopyStatus("Plain text copied.");
                            toast({ title: "Plain text copied", description: "A clean version of the email is on your clipboard.", variant: "success" });
                          } catch {
                            setCopyStatus("Could not copy plain text.");
                            toast({ title: "Could not copy plain text", description: "Please try again.", variant: "error" });
                          }
                        }}>
                          <Copy className="h-4 w-4" />
                          Copy plain text
                        </BrandButton>
                        <BrandButton variant="secondary" onClick={() => window.open(`mailto:${reportEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailText)}`, "_blank")}>
                          <Mail className="h-4 w-4" />
                          Open Draft
                        </BrandButton>
                        <BrandButton onClick={() => window.print()}>
                          <Download className="h-4 w-4" />
                          Download PDF
                        </BrandButton>
                      </div>
                    </div>
                    {copyStatus ? <p className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] px-3 py-2 text-sm text-[var(--rise-text-muted)]">{copyStatus}</p> : null}
                    <div className="overflow-hidden rounded-3xl border border-[var(--rise-border)] bg-[var(--rise-surface)]">
                      <div
                        className="bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] px-5 py-4 text-white"
                        style={emailPreviewStyle}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">RISE Tutoring</p>
                        <h4 className="mt-1 text-2xl font-semibold">{child.fullName}</h4>
                        <p className="text-sm opacity-90">
                          {reportDate} · {session.topic}
                        </p>
                      </div>
                      <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2" style={emailPreviewStyle}>
                        <div className="rounded-2xl bg-[var(--rise-surface-soft)] p-4 md:col-span-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--rise-purple)]">Parent update</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--rise-text)]">
                            Here is {child.fullName}&apos;s latest tutoring update from today&apos;s session.
                          </p>
                        </div>
                        {emailCards.map((item) => (
                          <div key={item.label} className={`rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4 ${item.span}`}>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--rise-purple)]">{item.label}</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--rise-text)]">{item.value}</p>
                          </div>
                        ))}
                        <div className="rounded-2xl bg-[var(--rise-surface-soft)] p-4 md:col-span-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--rise-purple)]">Tutor summary</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--rise-text)]">{report.tutorSummary}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-[var(--rise-text-muted)]">For best formatting, copy the styled email and paste it into Gmail.</p>
                  </Card>
                </div>
                <div className="min-h-0 space-y-4">
                  <Card className="space-y-4 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--rise-purple)]">Parent delivery</p>
                        <h4 className="text-lg font-semibold text-[var(--rise-heading)]">Ready to send</h4>
                      </div>
                      <span className="rounded-full bg-[var(--rise-purple-soft)] px-3 py-1 text-xs font-bold text-[var(--rise-purple)]">draft</span>
                    </div>
                    <div className="rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
                      <p className="text-sm font-semibold text-[var(--rise-heading)]">To</p>
                      <p className="mt-1 break-words text-sm text-[var(--rise-text-muted)]">{reportEmail || "No parent email set"}</p>
                      <p className="mt-3 text-sm font-semibold text-[var(--rise-heading)]">Subject</p>
                      <p className="mt-1 break-words text-sm text-[var(--rise-text-muted)]">{emailSubject}</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4 text-sm leading-6 text-[var(--rise-text-muted)]">
                      For best formatting, copy the styled email and paste it into Gmail. The plain-text draft is available if you prefer it.
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <BrandButton variant="secondary" onClick={() => setSendOpen(false)}>
                        Cancel
                      </BrandButton>
                      <BrandButton
                        variant="secondary"
                        onClick={markAsSent}
                      >
                        <Save className="h-4 w-4" />
                        Mark as sent
                      </BrandButton>
                    </div>
                  </Card>
                  <Card className="space-y-3 p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-[var(--rise-purple)]" />
                      <h4 className="text-base font-semibold text-[var(--rise-heading)]">Email preview HTML</h4>
                    </div>
                    <details className="rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-3">
                      <summary className="cursor-pointer text-sm font-semibold text-[var(--rise-heading)]">Show HTML</summary>
                      <pre className="mt-3 max-h-56 overflow-auto rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-3 text-[10px] leading-5 text-[var(--rise-text-muted)]">
                        {emailHtml}
                      </pre>
                    </details>
                  </Card>
                </div>
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
