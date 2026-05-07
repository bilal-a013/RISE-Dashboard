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
import { generateParentReport } from "../../../../lib/reportGenerator";
import { getReportBundle, updateReport } from "../../../../lib/supabaseData";
import type { ParentReport, SessionLog } from "../../../../types/rise";

export default function EditReportPage() {
  const params = useParams<{ reportId: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sentStatus, setSentStatus] = useState("draft");
  const [sentTo, setSentTo] = useState("");
  const [report, setReport] = useState<ParentReport | null>(null);
  const [studentName, setStudentName] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [status, setStatus] = useState("Loading report...");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    getReportBundle(params.reportId)
      .then((bundle) => {
        let parsedBody: { plainText?: string } | null = null;
        try {
          parsedBody = bundle.reportRow.body ? (JSON.parse(bundle.reportRow.body) as { plainText?: string }) : null;
        } catch {
          parsedBody = null;
        }
        const generated = bundle.parentReport ?? generateParentReport(bundle.child, bundle.session, bundle.sessions);
        setReport(generated);
        setTitle(bundle.reportRow.title);
        setBody(parsedBody?.plainText || generated.tutorSummary);
        setSentStatus(bundle.reportRow.sent_status || "draft");
        setSentTo(bundle.reportRow.sent_to || bundle.child.parentEmail || "");
        setStudentName(bundle.child.fullName);
        setSessionDate(bundle.session.sessionDate);
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "Could not load report."));
  }, [params.reportId]);

  async function handleSave() {
    if (!report) return;
    setSaving(true);
    try {
      const updated = {
        ...report,
        title: title.trim() || report.title,
        tutorSummary: body.trim() || report.tutorSummary,
      };
      await updateReport(params.reportId, {
        title: updated.title,
        body: JSON.stringify({ parentReport: updated, plainText: body.trim() || report.tutorSummary }),
        sent_status: sentStatus,
        sent_to: sentTo.trim() || null,
      });
      toast({ title: "Report updated successfully", description: "The report changes were saved to Supabase.", variant: "success" });
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
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-3xl font-semibold text-[var(--rise-heading)]">Edit Report</h1>
            <p className="mt-2 text-base text-[var(--rise-text-muted)] sm:text-lg">
              {report
                ? `Editing the report for ${studentName} on ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(sessionDate))}.`
                : "Update the stored parent report before saving."}
            </p>
          </header>

          {status ? <p className="mb-6 rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface)] p-4 text-sm font-semibold text-[var(--rise-text-muted)]">{status}</p> : null}

          <Card className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[var(--rise-heading)]">Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="rise-input h-12 w-full px-4"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[var(--rise-heading)]">Sent status</span>
                <select
                  value={sentStatus}
                  onChange={(event) => setSentStatus(event.target.value)}
                  className="rise-input h-12 w-full px-4"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-[var(--rise-heading)]">Parent email</span>
                <input
                  value={sentTo}
                  onChange={(event) => setSentTo(event.target.value)}
                  type="email"
                  className="rise-input h-12 w-full px-4"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-[var(--rise-heading)]">Report body</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={10}
                className="rise-input min-h-64 w-full px-4 py-3 leading-7"
              />
            </label>

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
        <Footer />
      </main>
    </ProtectedContent>
  );
}
