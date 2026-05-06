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

export default function ReportPage() {
  const params = useParams<{ reportId: string }>();
  const [data, setData] = useState<{ child: ChildProfile; session: SessionLog; report: ParentReport } | null>(null);
  const [status, setStatus] = useState("Loading report...");
  const [deleteText, setDeleteText] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
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

  const reportEmail = data?.child.parentEmail || "";
  const reportDate = data ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(data.session.sessionDate)) : "";
  const emailSubject = data ? `RISE Tutoring Report - ${data.child.fullName} - ${reportDate}` : "";
  const emailText = data
    ? [
        `Hi ${data.child.parentName},`,
        "",
        `Here is the RISE Tutoring report for ${data.child.fullName} from ${reportDate}.`,
        "",
        `Today’s focus: ${data.report.todayFocus}`,
        `What went well: ${data.report.whatWentWell.join(" • ")}`,
        `Still needs support: ${data.report.stillNeedsSupport}`,
        `Homework: ${data.report.homeworkAssigned}`,
        `Next focus: ${data.report.nextSessionFocus}`,
        "",
        `Tutor summary: ${data.report.tutorSummary}`,
        "",
        "Please attach the downloaded PDF before sending if you are sharing by email outside RISE Dashboard.",
        "",
        "Best,",
        "Elena Dragan",
      ].join("\n")
    : "";
  const emailHtml = data
    ? `
      <div style="font-family: Inter, Arial, sans-serif; background:#fcf8ff; padding:24px; color:#1b1b23;">
        <div style="max-width:720px; margin:0 auto; background:#fff; border:1px solid #c7c4d7; border-radius:24px; overflow:hidden; box-shadow:0 10px 30px rgba(70,72,212,.08);">
          <div style="background:linear-gradient(135deg,#4648d4 0%,#8127cf 100%); color:white; padding:22px 24px;">
            <div style="font-size:12px; letter-spacing:.12em; text-transform:uppercase; opacity:.85;">RISE Tutoring</div>
            <div style="font-size:24px; font-weight:700; margin-top:4px;">${emailSubject}</div>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 16px; font-size:15px; line-height:1.6;">Hi ${data.child.parentName},</p>
            <p style="margin:0 0 18px; font-size:15px; line-height:1.6;">Here is a concise summary of ${data.child.fullName}'s latest tutoring session.</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px;">
              ${[
                ["Today's Focus", data.report.todayFocus],
                ["What Went Well", data.report.whatWentWell.join(" • ")],
                ["Still Needs Support", data.report.stillNeedsSupport],
                ["Homework", data.report.homeworkAssigned],
                ["Next Focus", data.report.nextSessionFocus],
                ["Tutor Summary", data.report.tutorSummary],
              ]
                .map(
                  ([label, value]) =>
                    `<div style="border:1px solid #e9e6f3; border-radius:18px; padding:12px 14px; background:#f5f2fe;"><div style="font-size:11px; font-weight:700; color:#4648d4; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px;">${label}</div><div style="font-size:14px; line-height:1.5; color:#1b1b23;">${String(value)}</div></div>`
                )
                .join("")}
            </div>
            <p style="margin:0; font-size:13px; color:#464554; line-height:1.5;">Please attach the downloaded PDF before sending if you are sharing this outside the dashboard.</p>
            <p style="margin:18px 0 0; font-size:14px; line-height:1.6;">Best,<br/>Elena Dragan</p>
          </div>
        </div>
      </div>`
    : "";

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

  async function markAsSent() {
    if (!data) return;
    try {
      const updated = await markReportSent(data.report.id, data.child.parentEmail || null);
      void updated;
      setStatus("Marked as sent.");
      setSendOpen(false);
    } catch (error) {
      setStatus(isDev && error instanceof Error ? error.message : "Could not update sent status.");
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(`${emailSubject}\n\n${emailText}`);
      setCopyStatus("Email copied.");
    } catch {
      setCopyStatus("Could not copy email.");
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-[#c7c4d7] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#e9e6f3] bg-[#f5f2fe] px-6 py-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#1b1b23]">Send to Parent</h3>
                  <p className="text-sm text-[#464554]">Preview the email, download the PDF, then send or mark as sent.</p>
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
              <div className="grid gap-6 p-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <Card className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#4648d4]">Email draft</p>
                        <h4 className="text-lg font-semibold text-[#1b1b23]">{emailSubject}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <BrandButton variant="secondary" onClick={copyEmail}>
                          <Copy className="h-4 w-4" />
                          Copy
                        </BrandButton>
                        <BrandButton
                          variant="secondary"
                          onClick={() => window.open(`mailto:${reportEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailText)}`, "_blank")}
                        >
                          <Mail className="h-4 w-4" />
                          Open Draft
                        </BrandButton>
                        <BrandButton onClick={() => window.print()}>
                          <Download className="h-4 w-4" />
                          Download PDF
                        </BrandButton>
                      </div>
                    </div>
                    {copyStatus ? <p className="rounded-xl border border-[#e9e6f3] bg-[#f5f2fe] px-3 py-2 text-sm text-[#464554]">{copyStatus}</p> : null}
                    <div className="overflow-hidden rounded-3xl border border-[#c7c4d7] bg-white">
                      <div className="bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] px-5 py-4 text-white">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">RISE Tutoring</p>
                        <h4 className="mt-1 text-2xl font-semibold">{child.fullName}</h4>
                        <p className="text-sm opacity-90">{reportDate} · {session.topic}</p>
                      </div>
                      <div className="grid gap-3 p-5 md:grid-cols-2">
                        <div className="rounded-2xl bg-[#f5f2fe] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4648d4]">Today&apos;s Focus</p>
                          <p className="mt-2 text-sm leading-6 text-[#1b1b23]">{report.todayFocus}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f5f2fe] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4648d4]">What Went Well</p>
                          <p className="mt-2 text-sm leading-6 text-[#1b1b23]">{report.whatWentWell.join(" • ")}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f5f2fe] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4648d4]">Still Needs Support</p>
                          <p className="mt-2 text-sm leading-6 text-[#1b1b23]">{report.stillNeedsSupport}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f5f2fe] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4648d4]">Homework</p>
                          <p className="mt-2 text-sm leading-6 text-[#1b1b23]">{report.homeworkAssigned}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f5f2fe] p-4 md:col-span-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4648d4]">Next Focus</p>
                          <p className="mt-2 text-sm leading-6 text-[#1b1b23]">{report.nextSessionFocus}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-[#464554]">{emailText}</p>
                  </Card>
                </div>
                <div className="space-y-4">
                  <Card className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#4648d4]">Parent delivery</p>
                        <h4 className="text-lg font-semibold text-[#1b1b23]">Ready to send</h4>
                      </div>
                      <span className="rounded-full bg-[#e1e0ff] px-3 py-1 text-xs font-bold text-[#4648d4]">draft</span>
                    </div>
                    <div className="rounded-2xl border border-[#c7c4d7] bg-white p-4">
                      <p className="text-sm font-semibold text-[#1b1b23]">To</p>
                      <p className="mt-1 text-sm text-[#464554]">{reportEmail || "No parent email set"}</p>
                      <p className="mt-3 text-sm font-semibold text-[#1b1b23]">Subject</p>
                      <p className="mt-1 text-sm text-[#464554]">{emailSubject}</p>
                    </div>
                    <div className="rounded-2xl border border-[#c7c4d7] bg-[#fffaf2] p-4 text-sm leading-6 text-[#764800]">
                      Download the PDF first, then open or copy the email draft. Mailto cannot attach the file automatically, so attach the PDF manually before sending.
                    </div>
                    <div className="flex flex-wrap justify-end gap-3">
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
                  <Card className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-[#4648d4]" />
                      <h4 className="text-base font-semibold text-[#1b1b23]">Email preview HTML</h4>
                    </div>
                    <pre className="max-h-[30rem] overflow-auto rounded-2xl border border-[#e9e6f3] bg-[#1b1b23] p-4 text-[11px] leading-5 text-[#f2effb]">
                      {emailHtml}
                    </pre>
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
