"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Info, KeyRound, Smile, UsersRound } from "lucide-react";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Card } from "../../../components/rise/Card";
import { ChipSelector } from "../../../components/rise/ChipSelector";
import { Footer } from "../../../components/rise/Footer";
import { TopNav } from "../../../components/rise/TopNav";
import { TutorKeyBadge } from "../../../components/rise/TutorKeyBadge";
import { getRiseStore, syncChildToSupabase, upsertChildProfile } from "../../../lib/localStorageStore";
import { generateTutorKey } from "../../../lib/tutorKey";
import type { ChildProfile } from "../../../types/rise";

function makeId(fullName: string) {
  return fullName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `child-${Date.now()}`;
}

export default function NewStudentPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("Ayaan Khan");
  const [preferredName, setPreferredName] = useState("Ayaan");
  const [age, setAge] = useState("15");
  const [yearGroup, setYearGroup] = useState("Year 10");
  const [pronouns, setPronouns] = useState("he/him");
  const [school, setSchool] = useState("Northbridge Academy");
  const [subjects, setSubjects] = useState(["GCSE Physics", "Maths"]);
  const [examBoard, setExamBoard] = useState("AQA");
  const [currentWorkingLevel, setCurrentWorkingLevel] = useState("Grade 5");
  const [targetLevel, setTargetLevel] = useState("Grade 7");
  const [mainGoals, setMainGoals] = useState("Build exam confidence and secure Grade 7 across Physics problem-solving.");
  const [strengths, setStrengths] = useState(["Visual reasoning", "Good recall"]);
  const [struggles, setStruggles] = useState(["Interference patterns", "Explaining current direction"]);
  const [currentTopics, setCurrentTopics] = useState("EM Induction, Wave Optics");
  const [learningStyle, setLearningStyle] = useState("Visual examples followed by short independent practice.");
  const [parentName, setParentName] = useState("Zara Khan");
  const [parentEmail, setParentEmail] = useState("zara.khan@example.com");
  const [parentPhone, setParentPhone] = useState("+44 7700 900234");
  const [reportMethod, setReportMethod] = useState<ChildProfile["preferredReportMethod"]>("email");
  const [currentHomework, setCurrentHomework] = useState("Exam-style EM induction questions 1-8.");
  const [upcomingTestDate, setUpcomingTestDate] = useState("");
  const [sessionFrequency, setSessionFrequency] = useState("Weekly");
  const [longTermGoal, setLongTermGoal] = useState("Secure GCSE Grade 7 in Physics.");
  const [tutorNotes, setTutorNotes] = useState("Responds well when abstract physics is linked to diagrams.");
  const tutorKey = useMemo(() => (fullName.trim() === "Ayaan Khan" ? "RISE-AK47" : generateTutorKey(fullName)), [fullName]);
  const [status, setStatus] = useState("Tutor key ready");

  useEffect(() => {
    const childId = searchParams.get("childId");
    if (!childId) return;
    const child = getRiseStore().children.find((item) => item.id === childId);
    if (!child) return;

    setFullName(child.fullName);
    setPreferredName(child.preferredName || "");
    setAge(child.age?.toString() || "");
    setYearGroup(child.yearGroup);
    setPronouns(child.pronouns || "");
    setSchool(child.school || "");
    setSubjects(child.subjects.length ? child.subjects : ["GCSE Physics"]);
    setExamBoard(child.examBoard || "");
    setCurrentWorkingLevel(child.currentWorkingLevel);
    setTargetLevel(child.targetLevel);
    setMainGoals(child.mainGoals || "");
    setStrengths(child.strengths || []);
    setStruggles(child.struggles || []);
    setCurrentTopics(child.currentTopics?.join(", ") || "");
    setLearningStyle(child.learningStyle || "");
    setParentName(child.parentName);
    setParentEmail(child.parentEmail);
    setParentPhone(child.parentPhone || "");
    setReportMethod(child.preferredReportMethod || "email");
    setCurrentHomework(child.currentHomework || "");
    setUpcomingTestDate(child.upcomingTestDate || "");
    setSessionFrequency(child.sessionFrequency || "");
    setLongTermGoal(child.longTermGoal || "");
    setTutorNotes(child.tutorNotes || "");
    setStatus("Loaded child profile for editing");
  }, [searchParams]);

  function buildChild(): ChildProfile {
    const timestamp = new Date().toISOString();
    return {
      id: makeId(fullName),
      tutorKey,
      fullName,
      preferredName,
      age: Number(age) || undefined,
      pronouns,
      yearGroup,
      school,
      subjects,
      examBoard,
      currentWorkingLevel,
      targetLevel,
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
      parentEmail,
      parentPhone,
      preferredReportMethod: reportMethod,
      currentHomework,
      upcomingTestDate,
      longTermGoal,
      sessionFrequency,
      tutorNotes,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  async function saveProfile() {
    // TODO: Swap local mock persistence for Supabase/Firebase upsert.
    const child = buildChild();
    upsertChildProfile(child);
    const syncResult = await syncChildToSupabase(child);
    setStatus(syncResult.ok ? "Profile saved locally and synced" : "Profile saved locally");
  }

  async function startFirstSession() {
    const child = buildChild();
    upsertChildProfile(child);
    await syncChildToSupabase(child);
    router.push(`/sessions/new/${child.id}`);
  }

  return (
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
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={preferredName} onChange={(event) => setPreferredName(event.target.value)} placeholder="Preferred name" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={age} onChange={(event) => setAge(event.target.value)} placeholder="Age" type="number" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={yearGroup} onChange={(event) => setYearGroup(event.target.value)} placeholder="Academic year" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
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
                  <ChipSelector options={["GCSE Physics", "Maths", "English Literature", "Chemistry", "Biology"]} value={subjects} onChange={setSubjects} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <input value={examBoard} onChange={(event) => setExamBoard(event.target.value)} placeholder="Exam board" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                  <input value={currentWorkingLevel} onChange={(event) => setCurrentWorkingLevel(event.target.value)} placeholder="Current level" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                  <input value={targetLevel} onChange={(event) => setTargetLevel(event.target.value)} placeholder="Target level" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                </div>
                <textarea value={mainGoals} onChange={(event) => setMainGoals(event.target.value)} rows={3} placeholder="Primary learning goals" className="w-full rounded-xl border border-[#c7c4d7] px-4 py-3 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#464554]">Key strengths</p>
                    <ChipSelector options={["Visual reasoning", "Good recall", "Verbal ideas", "Pattern spotting"]} value={strengths} onChange={setStrengths} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#464554]">Key struggles</p>
                    <ChipSelector options={["Interference patterns", "Timed essays", "Written explanations", "Equation signs"]} value={struggles} onChange={setStruggles} />
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
                <input value={learningStyle} onChange={(event) => setLearningStyle(event.target.value)} placeholder="Learning style optional" className="h-12 w-full rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
              </div>
            </Card>

            <Card>
              <div className="mb-5 flex items-center gap-3">
                <UsersRound className="h-5 w-5 text-[#4648d4]" />
                <h2 className="text-xl font-semibold">Parent Details</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={parentName} onChange={(event) => setParentName(event.target.value)} placeholder="Parent/guardian name" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input placeholder="Relationship to child" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} placeholder="Contact email" type="email" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={parentPhone} onChange={(event) => setParentPhone(event.target.value)} placeholder="Phone optional" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
              </div>
              <div className="mt-5 flex flex-wrap gap-4">
                {(["email", "pdf", "whatsapp", "copy"] as const).map((method) => (
                  <label key={method} className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={reportMethod === method} onChange={() => setReportMethod(method)} className="text-[#4648d4] focus:ring-[#4648d4]" />
                    {method === "email" ? "Email Digest" : method === "pdf" ? "Dashboard Link / PDF" : method}
                  </label>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-5 text-xl font-semibold">Current Plan</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={currentHomework} onChange={(event) => setCurrentHomework(event.target.value)} placeholder="Current homework assigned" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={upcomingTestDate} onChange={(event) => setUpcomingTestDate(event.target.value)} type="date" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={sessionFrequency} onChange={(event) => setSessionFrequency(event.target.value)} placeholder="Session frequency" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
                <input value={longTermGoal} onChange={(event) => setLongTermGoal(event.target.value)} placeholder="Long-term target" className="h-12 rounded-xl border border-[#c7c4d7] px-4 outline-none transition focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white" />
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
                  <BrandButton onClick={startFirstSession}>Start First Session Log</BrandButton>
                  <BrandButton variant="secondary" onClick={saveProfile}>Save Profile for Later</BrandButton>
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
  );
}
