"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { ProtectedContent } from "../../../../components/rise/AuthProvider";
import { BrandButton } from "../../../../components/rise/BrandButton";
import { Card } from "../../../../components/rise/Card";
import { Footer } from "../../../../components/rise/Footer";
import { TopNav } from "../../../../components/rise/TopNav";
import { useToast } from "../../../../components/rise/ToastProvider";
import { generateParentReport, reportSectionsFromParentReport, reportSectionsToParentReport, reportSectionsToPlainText } from "../../../../lib/reportGenerator";
import { getReportBundle, updateReport } from "../../../../lib/supabaseData";
import type { ParentReport, ReportSections } from "../../../../types/rise";

const confidenceOptions = ["Low", "Developing", "Steady", "Good", "Strong"];
const homeworkOptions = [
  "No formal homework set",
  "Homework assigned",
  "Cognito assigned",
  "Continue school homework",
  "Revision practice set",
];
const priorityOptions = ["Low priority", "Medium priority", "High priority"];
const sentStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
];

function fallbackReportSections(report: ParentReport, sentStatus: string, sentTo: string): ReportSections {
  return reportSectionsFromParentReport(report, {
    sentStatus,
    sentTo,
    priorityTag: "Medium priority",
  });
}

function splitBullets(value: string) {
  return value
    .split(/\n+/)
    .map((part) => part.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export default function EditReportPage() {
  const params = useParams<{ reportId: string }>();
  const router = useRouter();
  const [bundle, setBundle] = useState<Awaited<ReturnType<typeof getReportBundle>> | null>(null);
  const [title, setTitle] = useState("");
  const [sentStatus, setSentStatus] = useState("draft");
  const [sentTo, setSentTo] = useState("");
  const [priorityTag, setPriorityTag] = useState("Medium priority");
  const [todayFocus, setTodayFocus] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [stillNeedsSupport, setStillNeedsSupport] = useState("");
  const [confidence, setConfidence] = useState("Steady");
  const [homework, setHomework] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [tutorSummary, setTutorSummary] = useState("");
  const [status, setStatus] = useState("Loading report...");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    getReportBundle(params.reportId)
      .then((nextBundle) => {
        setBundle(nextBundle);
        if (!nextBundle.session) {
          setStatus("No session found for this report.");
          return;
        }

        const generated = nextBundle.parentReport ?? generateParentReport(nextBundle.child, nextBundle.session, nextBundle.sessions);
        const sections = nextBundle.reportSections ?? fallbackReportSections(generated, nextBundle.reportRow.sent_status || "draft", nextBundle.reportRow.sent_to || nextBundle.child.parentEmail || "");

        setTitle(sections.title || nextBundle.reportRow.title);
        setSentStatus(sections.sentStatus || nextBundle.reportRow.sent_status || "draft");
        setSentTo(sections.sentTo || nextBundle.reportRow.sent_to || nextBundle.child.parentEmail || "");
        setPriorityTag(sections.priorityTag || "Medium priority");
        setTodayFocus(sections.todayFocus || generated.todayFocus);
        setWhatWentWell(sections.whatWentWell || generated.whatWentWell.join("\n"));
        setStillNeedsSupport(sections.stillNeedsSupport || generated.stillNeedsSupport);
        setConfidence(sections.confidence || generated.progressSnapshot.confidenceLabel);
        setHomework(sections.homework || generated.homeworkAssigned);
        setNextFocus(sections.nextFocus || generated.nextSessionFocus);
        setTutorSummary(sections.tutorSummary || generated.tutorSummary);
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "Could not load report."));
  }, [params.reportId]);

  async function handleSave() {
    if (!bundle?.session) return;
    setSaving(true);
    try {
      const sections: ReportSections = {
        title: title.trim() || bundle.reportRow.title,
        sentStatus,
        sentTo: sentTo.trim() || undefined,
        priorityTag,
        todayFocus: todayFocus.trim(),
        whatWentWell: whatWentWell.trim(),
        stillNeedsSupport: stillNeedsSupport.trim(),
        confidence,
        homework: homework.trim(),
        nextFocus: nextFocus.trim(),
        tutorSummary: tutorSummary.trim(),
      };

      const generated = reportSectionsToParentReport(bundle.child, bundle.session, sections, bundle.parentReport ?? undefined);
      const plainText = reportSectionsToPlainText(bundle.child, bundle.session, generated, sections);

      await updateReport(params.reportId, {
        title: generated.title,
        body: plainText,
        report_sections: sections,
        sent_status: sentStatus,
        sent_to: sentTo.trim() || null,
        sent_at: sentStatus === "sent" ? bundle.reportRow.sent_at || new Date().toISOString() : null,
      });

      toast({ title: "Report updated successfully", description: "The structured report was saved to Supabase.", variant: "success" });
      router.push(`/reports/${params.reportId}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update report.";
      setStatus(isDev ? message : "Could not update report.");
      toast({ title: "Could not update report", description: isDev ? message : "Please try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedContent>
      <main className="rise-page min-h-screen animate-rise-page">
        <TopNav />
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-3xl font-semibold text-[var(--rise-heading)]">Edit Report</h1>
            <p className="mt-2 text-base text-[var(--rise-text-muted)] sm:text-lg">
              {bundle
                ? `Editing the report for ${bundle.child.fullName} from ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(bundle.session.sessionDate))}.`
                : "Update the stored parent report before saving."}
            </p>
          </header>

          {status ? <p className="mb-6 rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4 text-sm font-semibold text-[var(--rise-text-muted)]">{status}</p> : null}

          {bundle ? (
            <div className="space-y-6">
              <Card className="space-y-4 p-5 sm:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Report title</span>
                    <input value={title} onChange={(event) => setTitle(event.target.value)} className="rise-input h-12 w-full px-4" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Sent status</span>
                    <select value={sentStatus} onChange={(event) => setSentStatus(event.target.value)} className="rise-input h-12 w-full px-4">
                      {sentStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Parent email</span>
                    <input value={sentTo} onChange={(event) => setSentTo(event.target.value)} type="email" className="rise-input h-12 w-full px-4" />
                  </label>
                </div>
              </Card>

              <Card className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-[var(--rise-heading)]">Structured sections</h2>
                  <span className="rounded-full border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--rise-text-muted)]">
                    {bundle.child.fullName}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Today&apos;s focus</span>
                    <textarea value={todayFocus} onChange={(event) => setTodayFocus(event.target.value)} rows={3} className="rise-input w-full px-4 py-3 leading-7" />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">What went well</span>
                    <textarea value={whatWentWell} onChange={(event) => setWhatWentWell(event.target.value)} rows={4} placeholder={"Add one point per line\nor short notes separated by lines"} className="rise-input w-full px-4 py-3 leading-7" />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Still needs support</span>
                    <textarea value={stillNeedsSupport} onChange={(event) => setStillNeedsSupport(event.target.value)} rows={3} className="rise-input w-full px-4 py-3 leading-7" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Confidence</span>
                    <select value={confidence} onChange={(event) => setConfidence(event.target.value)} className="rise-input h-12 w-full px-4">
                      {confidenceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Priority tag</span>
                    <select value={priorityTag} onChange={(event) => setPriorityTag(event.target.value)} className="rise-input h-12 w-full px-4">
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Homework</span>
                    <textarea
                      value={homework}
                      onChange={(event) => setHomework(event.target.value)}
                      rows={3}
                      placeholder={homeworkOptions.join(" · ")}
                      className="rise-input w-full px-4 py-3 leading-7"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Next focus</span>
                    <textarea value={nextFocus} onChange={(event) => setNextFocus(event.target.value)} rows={3} className="rise-input w-full px-4 py-3 leading-7" />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--rise-heading)]">Tutor summary</span>
                    <textarea value={tutorSummary} onChange={(event) => setTutorSummary(event.target.value)} rows={4} className="rise-input w-full px-4 py-3 leading-7" />
                  </label>
                </div>
              </Card>

              <Card className="space-y-3 p-5 sm:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--rise-text-soft)]">Student</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--rise-heading)]">{bundle.child.fullName}</p>
                    <p className="mt-1 text-sm text-[var(--rise-text-muted)]">{bundle.child.yearGroup} · {bundle.child.subjects.join(" / ") || "Subjects not set"}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--rise-text-soft)]">Session</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--rise-heading)]">
                      {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(bundle.session.sessionDate))}
                    </p>
                    <p className="mt-1 text-sm text-[var(--rise-text-muted)]">{bundle.session.topic}</p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <BrandButton variant="secondary" onClick={() => router.push(`/reports/${params.reportId}`)}>
                    Cancel
                  </BrandButton>
                  <BrandButton onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Report"}
                  </BrandButton>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
        <Footer />
      </main>
    </ProtectedContent>
  );
}
