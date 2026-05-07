"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FileText, Save, Sparkles } from "lucide-react";
import { BrandButton } from "../../../../components/rise/BrandButton";
import { Card } from "../../../../components/rise/Card";
import { ChipSelector } from "../../../../components/rise/ChipSelector";
import { Footer } from "../../../../components/rise/Footer";
import { confidenceOptions, progressOptions, RatingSelector } from "../../../../components/rise/RatingSelector";
import { SegmentedSelector } from "../../../../components/rise/SegmentedSelector";
import { SessionTimeline } from "../../../../components/rise/SessionTimeline";
import { TopNav } from "../../../../components/rise/TopNav";
import { useToast } from "../../../../components/rise/ToastProvider";
import { generateParentReport } from "../../../../lib/reportGenerator";
import { getStudent, insertReport, insertSession, listSessions, updateSession } from "../../../../lib/supabaseData";
import { initialsFromName } from "../../../../lib/tutorKey";
import type { ChildProfile, HomeworkStatus, Rating, ReportTone, SessionLog, UnderstandingToday } from "../../../../types/rise";

const sessionFocusOptions = ["New topic", "Revision", "Exam practice", "Assessment", "Homework review", "Weak area support", "Test preparation"];
const nextFocusOptions = ["Review topic", "New topic", "Exam questions", "Homework review", "Build confidence", "Timed practice", "Fill knowledge gaps"];
const skillOptions = ["Recall", "Understanding concepts", "Applying formulas", "Problem solving", "Exam technique", "Written explanations", "Accuracy", "Speed", "Confidence"];

export default function NewSessionPage() {
  const params = useParams<{ childId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const isDev = process.env.NODE_ENV !== "production";
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [previousSessions, setPreviousSessions] = useState<SessionLog[]>([]);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [topic, setTopic] = useState("Electromagnetic Induction");
  const [quickNotes, setQuickNotes] = useState("We linked field changes to induced current. Ayaan was guided at first, then became more independent after visual examples. Still needs support explaining current direction. Set exam-style questions 1-8 and start next time with a recap before transformers.");
  const [sessionFocus, setSessionFocus] = useState(["New topic"]);
  const [understandingToday, setUnderstandingToday] = useState<UnderstandingToday>("guided");
  const [effortEngagement, setEffortEngagement] = useState<Rating>(4);
  const [keySkillWorkedOn, setKeySkillWorkedOn] = useState("Understanding concepts");
  const [homeworkStatus, setHomeworkStatus] = useState<HomeworkStatus>("set-today");
  const [homeworkDetails, setHomeworkDetails] = useState("Exam-style EM induction questions 1-8.");
  const [nextLessonFocus, setNextLessonFocus] = useState(["Review topic"]);
  const [specificNextFocus, setSpecificNextFocus] = useState("Recap induced current direction, then introduce transformers.");
  const [progressRating, setProgressRating] = useState<Rating>(3);
  const [confidenceRating, setConfidenceRating] = useState<Rating>(3);
  const [reportTone, setReportTone] = useState<ReportTone>("balanced");
  const [includeInReport, setIncludeInReport] = useState({
    progressRating: true,
    confidenceRating: true,
    homework: true,
    nextSteps: true,
    previousSessionComparison: true,
  });
  const [status, setStatus] = useState("Ready to log");
  const editingSessionId = searchParams.get("sessionId");

  useEffect(() => {
    async function load() {
      try {
        const found = await getStudent(params.childId);
        const previous = await listSessions(found.id);
        const editingSession = editingSessionId ? previous.find((item) => item.id === editingSessionId) : null;
        setChild(found);
        setPreviousSessions(previous);
        if (editingSession) {
          setSessionId(editingSession.id);
          setSessionDate(editingSession.sessionDate);
          setTopic(editingSession.topic);
          setQuickNotes(editingSession.quickNotes);
          setSessionFocus(editingSession.sessionFocus.length ? editingSession.sessionFocus : ["Revision"]);
          setUnderstandingToday(editingSession.understandingToday);
          setEffortEngagement(editingSession.effortEngagement);
          setKeySkillWorkedOn(editingSession.keySkillWorkedOn);
          setHomeworkStatus(editingSession.homeworkStatus);
          setHomeworkDetails(editingSession.homeworkDetails || "");
          setNextLessonFocus(editingSession.nextLessonFocus.length ? editingSession.nextLessonFocus : ["Review topic"]);
          setSpecificNextFocus(editingSession.specificNextFocus || "");
          setProgressRating(editingSession.progressRating);
          setConfidenceRating(editingSession.confidenceRating);
          setReportTone(editingSession.reportTone);
        } else {
          setTopic(found.subjects[0] || "Session focus");
          setQuickNotes("");
          setHomeworkDetails(found.currentHomework || "");
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load child profile.");
      }
    }

    load();
  }, [params.childId, editingSessionId]);

  const session = useMemo<SessionLog | null>(() => {
    if (!child) return null;
    return {
      id: sessionId,
      childId: child.id,
      tutorId: child.tutorId || "",
      sessionDate,
      subject: child.subjects[0] || undefined,
      topic,
      quickNotes,
      sessionFocus,
      understandingToday,
      effortEngagement,
      keySkillWorkedOn,
      homeworkStatus,
      homeworkDetails: homeworkDetails || undefined,
      nextLessonFocus,
      specificNextFocus: specificNextFocus || undefined,
      progressRating,
      confidenceRating,
      reportTone,
      includeInReport,
      createdAt: new Date().toISOString(),
    };
  }, [
    child,
    sessionId,
    sessionDate,
    topic,
    quickNotes,
    sessionFocus,
    understandingToday,
    effortEngagement,
    keySkillWorkedOn,
    homeworkStatus,
    homeworkDetails,
    nextLessonFocus,
    specificNextFocus,
    progressRating,
    confidenceRating,
    reportTone,
    includeInReport,
  ]);

  async function saveSession() {
    if (!session) return;
    try {
      if (editingSessionId) {
        await updateSession({ ...session, id: editingSessionId }, child!);
        setStatus("Session updated successfully.");
        toast({ title: "Session updated", description: "The session changes were saved to Supabase.", variant: "success" });
      } else {
        await insertSession(session, child!);
        setStatus("Session saved successfully.");
        toast({ title: "Session saved", description: "The session was saved to Supabase.", variant: "success" });
      }
      setPreviousSessions(await listSessions(child!.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save session.";
      setStatus(isDev ? message : "Could not save session.");
      toast({ title: "Could not save session", description: isDev ? message : "Please try again.", variant: "error" });
    }
  }

  async function generateReport() {
    if (!child || !session) return;
    try {
      const savedSession = editingSessionId ? await updateSession({ ...session, id: editingSessionId }, child) : await insertSession(session, child);
      const report = generateParentReport(child, savedSession, previousSessions);
      await insertReport(report, savedSession, child);
      setStatus("Parent report generated.");
      toast({ title: "Report generated", description: "The parent report draft was saved to Supabase.", variant: "success" });
      router.push(`/reports/${report.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not generate report.";
      setStatus(isDev ? message : "Could not generate report.");
      toast({ title: "Could not generate report", description: isDev ? message : "Please try again.", variant: "error" });
    }
  }

  if (!child) return null;

  return (
    <main className="rise-page min-h-screen animate-rise-page">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--rise-heading)]">Quick Session Log</h1>
          <p className="mt-2 text-lg text-[var(--rise-text-muted)]">Log session details and performance metrics for today's lesson.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-8">
          <Card className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--rise-purple-soft)] text-xl font-black text-[var(--rise-purple)]">
                  {initialsFromName(child.fullName)}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{child.fullName}</h2>
                  <p className="mt-1 text-sm text-[var(--rise-text-muted)]">
                    {child.subjects.join(" / ")} · {child.currentWorkingLevel}→{child.targetLevel.replace("Grade ", "")}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] px-5 py-3 text-center">
                <span className="block text-xs font-bold uppercase tracking-wide text-[var(--rise-text-soft)]">Student ID</span>
                <span className="font-mono text-xl font-black text-[var(--rise-purple)]">{child.tutorKey}</span>
              </div>
            </Card>

            <Card className="space-y-5 p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase text-[#767586]">Session date</span>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(event) => setSessionDate(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#c7c4d7] bg-white px-4 text-sm text-[#1b1b23] outline-none transition placeholder:text-[#767586] focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase text-[#767586]">Topic</span>
                  <input
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#c7c4d7] bg-white px-4 text-sm text-[#1b1b23] outline-none transition placeholder:text-[#767586] focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white"
                  />
                </label>
              </div>
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase text-[#767586]">Quick session notes</span>
                <textarea
                  value={quickNotes}
                  onChange={(event) => setQuickNotes(event.target.value)}
                  rows={6}
                  placeholder="Outline key concepts covered and any specific challenges encountered..."
                  className="min-h-48 w-full resize-y rounded-2xl border border-[#c7c4d7] bg-white px-4 py-4 text-sm leading-6 text-[#1b1b23] shadow-sm outline-none transition placeholder:text-[#767586] focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white"
                />
              </label>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              <Card className="space-y-4 p-5 md:p-6">
                <div>
                  <h3 className="font-semibold">Session focus</h3>
                  <p className="mt-1 text-xs text-[#464554]">Tap to choose all that apply.</p>
                </div>
                <ChipSelector options={sessionFocusOptions} value={sessionFocus} onChange={setSessionFocus} />
              </Card>
              <Card className="space-y-4 p-5 md:p-6">
                <div>
                  <h3 className="font-semibold">Understanding today</h3>
                  <p className="mt-1 text-xs text-[#464554]">Pick the closest match for the session.</p>
                </div>
                <SegmentedSelector
                  value={understandingToday}
                  onChange={setUnderstandingToday}
                  options={[
                    { value: "lots-of-help", label: "🆘 Lots of help" },
                    { value: "guided", label: "🌱 Guided" },
                    { value: "mostly-independent", label: "🙂 Independent" },
                    { value: "secure", label: "✅ Secure" },
                  ]}
                />
              </Card>
              <RatingSelector label="Effort & engagement" value={effortEngagement} onChange={setEffortEngagement} options={[
                { value: 1, label: "Low" },
                { value: 2, label: "2" },
                { value: 3, label: "3" },
                { value: 4, label: "4" },
                { value: 5, label: "Excellent" },
              ]} />
              <Card className="space-y-4 p-5 md:p-6">
                <div>
                  <h3 className="font-semibold">Key skill worked on</h3>
                  <p className="mt-1 text-xs text-[#464554]">Choose the main skill you focused on.</p>
                </div>
                <select
                  value={keySkillWorkedOn}
                  onChange={(event) => setKeySkillWorkedOn(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#c7c4d7] bg-white px-4 text-sm text-[#1b1b23] outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white"
                >
                  {skillOptions.map((skill) => <option key={skill}>{skill}</option>)}
                </select>
              </Card>
              <Card className="space-y-4 p-5 md:p-6">
                <div>
                  <h3 className="font-semibold">Homework status</h3>
                  <p className="mt-1 text-xs text-[#464554]">Only show details when homework was set or reviewed.</p>
                </div>
                <SegmentedSelector
                  value={homeworkStatus}
                  onChange={setHomeworkStatus}
                  options={[
                    { value: "not-set", label: "Not set" },
                    { value: "set-today", label: "Set today" },
                    { value: "reviewed-today", label: "Reviewed today" },
                    { value: "incomplete", label: "Incomplete" },
                    { value: "completed", label: "Completed" },
                  ]}
                />
                {homeworkStatus === "set-today" || homeworkStatus === "reviewed-today" ? (
                  <input
                    value={homeworkDetails}
                    onChange={(event) => setHomeworkDetails(event.target.value)}
                    placeholder="Homework details..."
                    className="mt-2 h-11 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 text-sm text-[#1b1b23] outline-none transition placeholder:text-[#767586] focus:border-[#4648d4] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white"
                  />
                ) : null}
              </Card>
              <Card className="space-y-4 p-5 md:p-6">
                <div>
                  <h3 className="font-semibold">Next lesson focus</h3>
                  <p className="mt-1 text-xs text-[#464554]">Choose the next step and add a short note below.</p>
                </div>
                <ChipSelector options={nextFocusOptions} value={nextLessonFocus} onChange={setNextLessonFocus} />
                <input
                  value={specificNextFocus}
                  onChange={(event) => setSpecificNextFocus(event.target.value)}
                  placeholder="Specific next focus..."
                  className="h-11 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 text-sm text-[#1b1b23] outline-none transition placeholder:text-[#767586] focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white"
                />
              </Card>
            </div>

            <section className="grid gap-5 md:grid-cols-2">
              <RatingSelector label="Progress this session" value={progressRating} onChange={setProgressRating} options={progressOptions} />
              <RatingSelector label="Confidence level today" value={confidenceRating} onChange={setConfidenceRating} options={confidenceOptions} />
            </section>
          </section>

          <aside className="space-y-6 lg:col-span-4">
            <Card className="space-y-5 p-5 md:p-6">
              <h2 className="border-b border-[#c7c4d7] pb-3 text-xl font-semibold">Finalize Log</h2>
              <div>
                <p className="mb-3 text-xs font-bold uppercase text-[#767586]">Report tone</p>
                <SegmentedSelector
                  value={reportTone}
                  onChange={setReportTone}
                  options={[
                    { value: "balanced", label: "Balanced" },
                    { value: "encouraging", label: "Encouraging" },
                    { value: "direct", label: "Direct" },
                    { value: "detailed", label: "Detailed" },
                  ]}
                />
                <p className="mt-2 text-xs leading-5 text-[var(--rise-text-muted)]">
                  Tone adjusts the wording of the generated parent report.
                </p>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase text-[#767586]">Include in parent report</p>
                <div className="space-y-3">
                  {[
                    ["progressRating", "Progress rating"],
                    ["confidenceRating", "Confidence rating"],
                    ["homework", "Homework status"],
                    ["nextSteps", "Next steps"],
                    ["previousSessionComparison", "Previous session comparison"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={includeInReport[key as keyof typeof includeInReport]}
                        onChange={(event) => setIncludeInReport((prev) => ({ ...prev, [key]: event.target.checked }))}
                        className="rounded border-[#c7c4d7] text-[#4648d4]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3 border-t border-[#c7c4d7] pt-5">
                <BrandButton variant="primary" className="w-full" onClick={saveSession}>
                  <Save className="h-4 w-4" />
                  Save Session
                </BrandButton>
                <BrandButton variant="secondary" className="w-full" onClick={generateReport}>
                  <FileText className="h-4 w-4" />
                  Generate Parent Report
                </BrandButton>
                <div className="flex gap-3 rounded-xl border border-[#c7c4d7] bg-[#fcf8ff] p-3">
                  <Sparkles className="mt-1 h-5 w-5 text-[#8127cf]" />
                  <p className="text-xs leading-5 text-[#464554]">AI can help summarize these notes for the parent dashboard.</p>
                </div>
                <p className="text-center text-sm font-semibold text-[#4648d4]">{status}</p>
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-[#767586]">Previous Focus</h3>
              <div className="flex gap-3">
                <span className="w-1 rounded-full bg-[#8127cf]" />
                <div>
                  <p className="font-semibold">Last Topic: {previousSessions[0]?.topic || "Wave Optics"}</p>
                  <p className="mt-1 text-sm text-[#464554]">{previousSessions[0]?.quickNotes || "Struggled with interference patterns. Required visual aids."}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-[#767586]">Last 3 Sessions</h3>
              <SessionTimeline sessions={previousSessions} />
            </Card>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
}
