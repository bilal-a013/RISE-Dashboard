"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Info, KeyRound, Smile, UsersRound } from "lucide-react";
import { ProtectedContent } from "../../../components/rise/AuthProvider";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Card } from "../../../components/rise/Card";
import { ChipSelector } from "../../../components/rise/ChipSelector";
import { Footer } from "../../../components/rise/Footer";
import { TopNav } from "../../../components/rise/TopNav";
import { TutorKeyBadge } from "../../../components/rise/TutorKeyBadge";
import { getStudent, upsertStudent } from "../../../lib/supabaseData";
import { generateTutorKey } from "../../../lib/tutorKey";
import type { ChildProfile } from "../../../types/rise";

const educationStageOptions = ["", "Primary", "KS3", "GCSE"];
const yearGroupOptions = ["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11"];
const subjectOptions = [
  "Maths",
  "English",
  "Science",
  "Reading",
  "Writing",
  "Spelling",
  "Grammar",
  "Comprehension",
  "GCSE Physics",
  "GCSE Chemistry",
  "GCSE Biology",
  "English Literature",
  "English Language",
];
const strengthOptions = [
  "Visual reasoning",
  "Good recall",
  "Verbal ideas",
  "Pattern spotting",
  "Mental maths",
  "Problem solving",
  "Reading fluency",
  "Creative writing",
  "Confidence",
  "Focus",
  "Exam technique",
  "Independent work",
  "Quick learner",
  "Good vocabulary",
  "Logical thinking",
  "Homework consistency",
];
const struggleOptions = [
  "Interference patterns",
  "Timed essays",
  "Written explanations",
  "Equation signs",
  "Fractions",
  "Times tables",
  "Algebra basics",
  "Worded questions",
  "Reading comprehension",
  "Spelling",
  "Grammar",
  "Focus",
  "Confidence",
  "Exam timing",
  "Showing working",
  "Multi-step problems",
  "Homework consistency",
  "Revision habits",
];
const learningStyleOptions = ["", "Visual learner", "Step-by-step learner", "Practice-heavy learner", "Verbal explanation learner"];
const currentLevelOptions = [
  "",
  "Below Expected",
  "Working Towards",
  "Expected",
  "Greater Depth",
  "Year 1 level",
  "Year 2 level",
  "Year 3 level",
  "Year 4 level",
  "Year 5 level",
  "Year 6 level",
  "Year 7 level",
  "Year 8 level",
  "Year 9 level",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
];
const sessionFrequencyOptions = ["", "Weekly", "Twice weekly", "Fortnightly", "Ad hoc"];
const reportPreferenceOptions: Array<{ value: NonNullable<ChildProfile["preferredReportMethod"]>; label: string }> = [
  { value: "email", label: "Email Digest" },
  { value: "pdf", label: "Dashboard Link / PDF" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "copy", label: "Copy report" },
];

export default function NewStudentPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [age, setAge] = useState("");
  const [educationStage, setEducationStage] = useState("");
  const [yearGroup, setYearGroup] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [school, setSchool] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [examBoard, setExamBoard] = useState("");
  const [currentWorkingLevel, setCurrentWorkingLevel] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [mainGoals, setMainGoals] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [struggles, setStruggles] = useState<string[]>([]);
  const [currentTopics, setCurrentTopics] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentRelationship, setParentRelationship] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [reportMethod, setReportMethod] = useState<ChildProfile["preferredReportMethod"]>("email");
  const [currentHomework, setCurrentHomework] = useState("");
  const [homeworkDueDate, setHomeworkDueDate] = useState("");
  const [sessionFrequency, setSessionFrequency] = useState("");
  const [longTermTarget, setLongTermTarget] = useState("");
  const [nextSessionFocus, setNextSessionFocus] = useState("");
  const [tutorNotes, setTutorNotes] = useState("");
  const [tutorKey, setTutorKey] = useState("RISE-NEW");
  const [status, setStatus] = useState("Tutor key ready");
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    const childId = searchParams.get("childId");
    if (!childId) return;

    getStudent(childId)
      .then((child) => {
        setEditingId(child.id);
        setCreatedAt(child.createdAt);
        setTutorKey(child.tutorKey);
        setFullName(child.fullName);
        setPreferredName(child.preferredName || "");
        setAge(child.age?.toString() || "");
        setEducationStage(child.educationStage || "");
        setYearGroup(child.yearGroup);
        setPronouns(child.pronouns || "");
        setSchool(child.school || "");
        setSubjects(child.subjects.length ? child.subjects : []);
        setExamBoard(child.examBoard || "");
        setCurrentWorkingLevel(child.currentWorkingLevel);
        setTargetLevel(child.targetLevel);
        setMainGoals(child.mainGoals || "");
        setStrengths(child.strengths || []);
        setStruggles(child.struggles || []);
        setCurrentTopics(child.currentTopics?.join(", ") || "");
        setLearningStyle(child.learningStyle || "");
        setParentName(child.parentName);
        setParentRelationship(child.parentRelationship || "");
        setParentEmail(child.parentEmail);
        setParentPhone(child.parentPhone || "");
        setReportMethod(child.parentReportPreference || child.preferredReportMethod || "email");
        setCurrentHomework(child.currentHomework || "");
        setHomeworkDueDate(child.homeworkDueDate || "");
        setSessionFrequency(child.sessionFrequency || "");
        setLongTermTarget(child.longTermTarget || child.longTermGoal || "");
        setNextSessionFocus(child.nextSessionFocus || "");
        setTutorNotes(child.tutorNotes || "");
        setStatus("Loaded child profile for editing");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "Could not load child profile."));
  }, [searchParams]);

  useEffect(() => {
    if (editingId) return;
    setTutorKey(fullName.trim() ? generateTutorKey(fullName) : "RISE-NEW");
  }, [editingId, fullName]);

  function buildChild(): ChildProfile {
    const timestamp = new Date().toISOString();
      return {
        id: editingId || crypto.randomUUID(),
        tutorKey: tutorKey === "RISE-NEW" && fullName.trim() ? generateTutorKey(fullName) : tutorKey,
        fullName,
        preferredName,
        age: Number(age) || undefined,
        educationStage: educationStage || undefined,
        pronouns,
        yearGroup,
        school,
        subjects,
        examBoard,
        currentWorkingLevel,
        targetLevel,
        currentGrade: currentWorkingLevel,
        targetGrade: targetLevel,
        mainGoals,
        confidenceLevel: 3,
        strengths,
        struggles,
        currentTopics: currentTopics
          .split(",")
          .map((topic) => topic.trim())
          .filter(Boolean),
        learningStyle,
        parentName,
        parentRelationship,
        parentEmail,
        parentPhone,
        preferredReportMethod: reportMethod,
        parentReportPreference: reportMethod,
        currentHomework,
        homeworkDueDate: homeworkDueDate || undefined,
        sessionFrequency,
        longTermGoal: longTermTarget,
        longTermTarget,
        nextSessionFocus,
        tutorNotes,
        createdAt: createdAt || timestamp,
        updatedAt: timestamp,
      };
  }

  async function saveProfile() {
    try {
      const child = await upsertStudent(buildChild());
      setEditingId(child.id);
      setTutorKey(child.tutorKey);
      setStatus("Profile saved to Supabase");
      router.push("/students?saved=1");
    } catch (error) {
      setStatus(isDev && error instanceof Error ? error.message : "Could not save profile.");
    }
  }

  async function startFirstSession() {
    try {
      const child = await upsertStudent(buildChild());
      router.push(`/sessions/new/${child.id}`);
    } catch (error) {
      setStatus(isDev && error instanceof Error ? error.message : "Could not save profile.");
    }
  }

  return (
    <ProtectedContent>
      <main className="min-h-screen bg-[#fcf8ff]">
      <TopNav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-[#1b1b23]">Create Child Profile</h1>
          <p className="mt-2 text-lg text-[#464554]">Set up the child's tutoring profile once.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-8">
            <Card>
              <div className="mb-5 flex items-center gap-3">
                <Smile className="h-5 w-5 text-[#4648d4]" />
                <h2 className="text-xl font-semibold">Child Details</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" required className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={preferredName} onChange={(event) => setPreferredName(event.target.value)} placeholder="Preferred name" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={age} onChange={(event) => setAge(event.target.value)} placeholder="Age" type="number" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#464554]">Education stage</span>
                  <select value={educationStage} onChange={(event) => setEducationStage(event.target.value)} className="h-12 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white">
                    {educationStageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select stage"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#464554]">Year group</span>
                  <select value={yearGroup} onChange={(event) => setYearGroup(event.target.value)} required className="h-12 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white">
                    {yearGroupOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select year"}
                      </option>
                    ))}
                  </select>
                </label>
                <input value={pronouns} onChange={(event) => setPronouns(event.target.value)} placeholder="Pronouns" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={school} onChange={(event) => setSchool(event.target.value)} placeholder="School name optional" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
              </div>
            </Card>

            <Card>
              <div className="mb-5 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-[#4648d4]" />
                <h2 className="text-xl font-semibold">Tutoring Details</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#464554]">Subjects being tutored</p>
                  <ChipSelector options={subjectOptions} value={subjects} onChange={setSubjects} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[#464554]">Current level / grade</span>
                    <select value={currentWorkingLevel} onChange={(event) => setCurrentWorkingLevel(event.target.value)} className="h-12 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white">
                      {currentLevelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select level"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[#464554]">Target level / grade</span>
                    <select value={targetLevel} onChange={(event) => setTargetLevel(event.target.value)} className="h-12 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white">
                      {currentLevelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select target"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[#464554]">Exam board</span>
                    <input value={examBoard} onChange={(event) => setExamBoard(event.target.value)} placeholder="Optional for GCSE" className="h-12 w-full rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                  </label>
                </div>
                <textarea value={mainGoals} onChange={(event) => setMainGoals(event.target.value)} rows={3} placeholder="Primary learning goals" className="w-full rounded-xl border border-[#c7c4d7] px-4 py-3 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#464554]">Key strengths</p>
                    <ChipSelector options={strengthOptions} value={strengths} onChange={setStrengths} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#464554]">Key struggles</p>
                    <ChipSelector options={struggleOptions} value={struggles} onChange={setStruggles} />
                  </div>
                </div>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-[#464554]">Current topics</span>
                  <textarea
                    value={currentTopics}
                    onChange={(event) => setCurrentTopics(event.target.value)}
                    rows={3}
                    placeholder="Comma-separated topics or a quick note"
                    className="w-full rounded-xl border border-[#c7c4d7] px-4 py-3 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#464554]">Learning style</span>
                  <select value={learningStyle} onChange={(event) => setLearningStyle(event.target.value)} className="h-12 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white">
                    {learningStyleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Optional"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </Card>

            <Card>
              <div className="mb-5 flex items-center gap-3">
                <UsersRound className="h-5 w-5 text-[#4648d4]" />
                <h2 className="text-xl font-semibold">Parent Details</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={parentName} onChange={(event) => setParentName(event.target.value)} placeholder="Parent/guardian name" required className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={parentRelationship} onChange={(event) => setParentRelationship(event.target.value)} placeholder="Relationship to child" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} placeholder="Contact email" type="email" required className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={parentPhone} onChange={(event) => setParentPhone(event.target.value)} placeholder="Phone optional" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
              </div>
              <div className="mt-5 flex flex-wrap gap-4">
                {reportPreferenceOptions.map((method) => (
                  <label key={method.value} className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={reportMethod === method.value} onChange={() => setReportMethod(method.value)} className="text-[#4648d4] focus:ring-[#4648d4]" />
                    {method.label}
                  </label>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-5 text-xl font-semibold">Current Plan</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={currentHomework} onChange={(event) => setCurrentHomework(event.target.value)} placeholder="Current homework assigned" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#464554]">Homework due date</span>
                  <input value={homeworkDueDate} onChange={(event) => setHomeworkDueDate(event.target.value)} type="date" className="h-12 w-full rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#464554]">Session frequency</span>
                  <select value={sessionFrequency} onChange={(event) => setSessionFrequency(event.target.value)} className="h-12 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white">
                    {sessionFrequencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Optional"}
                      </option>
                    ))}
                  </select>
                </label>
                <input value={longTermTarget} onChange={(event) => setLongTermTarget(event.target.value)} placeholder="Long-term target" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={nextSessionFocus} onChange={(event) => setNextSessionFocus(event.target.value)} placeholder="Next session focus" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
              </div>
              <textarea value={tutorNotes} onChange={(event) => setTutorNotes(event.target.value)} rows={3} placeholder="Tutor notes" className="mt-4 w-full rounded-xl border border-[#c7c4d7] px-4 py-3 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
            </Card>
          </section>

          <aside className="space-y-5 lg:col-span-4">
            <div className="sticky top-28 space-y-5">
              <TutorKeyBadge tutorKey={tutorKey} onCopy={() => setStatus("Tutor key copied")} />
              <Card className="space-y-4 text-center">
                <KeyRound className="mx-auto h-8 w-8 text-[#4648d4]" />
                <h3 className="text-xl font-semibold">Tutor Key Generated</h3>
                <p className="text-sm text-[#464554]">{status}</p>
                <div className="flex flex-col gap-3">
                  <BrandButton type="button" onClick={startFirstSession}>Start First Session Log</BrandButton>
                  <BrandButton type="button" variant="secondary" onClick={saveProfile}>Save Profile for Later</BrandButton>
                </div>
              </Card>
              <Card className="bg-[#f0dbff]">
                <div className="flex gap-3">
                  <Info className="mt-1 h-5 w-5 text-[#8127cf]" />
                  <p className="text-sm leading-6 text-[#2c0051]">
                    Entering detailed learning struggles helps reports pinpoint exact areas for curriculum adjustment.
                  </p>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
      </main>
    </ProtectedContent>
  );
}
