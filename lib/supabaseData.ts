import { supabase } from "./supabase";
import type { ChildProfile, ParentReport, ReportRow, SessionLog, SessionRow, StudentRow } from "../types/rise";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
  return supabase;
}

export async function getCurrentUserId() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("You must be logged in.");
  return data.user.id;
}

export async function upsertProfile(fullName: string, email: string) {
  const client = requireSupabase();
  const userId = await getCurrentUserId();
  const { error } = await client.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      email,
      role: "tutor",
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export function studentRowToChildProfile(row: StudentRow): ChildProfile {
  return {
    id: row.id,
    tutorId: row.tutor_id,
    tutorKey: row.tutor_key,
    fullName: row.full_name,
    preferredName: row.preferred_name ?? undefined,
    age: row.age ?? undefined,
    pronouns: row.pronouns ?? undefined,
    yearGroup: row.year_group || "Year group not set",
    school: row.school ?? undefined,
    subjects: row.subjects ?? [],
    examBoard: row.exam_board ?? undefined,
    currentWorkingLevel: row.current_grade || "Current grade not set",
    targetLevel: row.target_grade || "Target grade not set",
    mainGoals: row.goals ?? undefined,
    confidenceLevel: 3,
    strengths: row.strengths ?? [],
    struggles: row.struggles ?? [],
    parentName: row.parent_name || "Parent not set",
    parentEmail: row.parent_email || "",
    parentPhone: row.parent_phone ?? undefined,
    status: row.status || "active",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function sessionRowToSessionLog(row: SessionRow): SessionLog {
  const strengths = row.strengths ?? [];
  const struggles = row.struggles ?? [];
  return {
    id: row.id,
    childId: row.student_id,
    tutorId: row.tutor_id,
    sessionDate: row.session_date,
    subject: row.subject ?? undefined,
    topic: row.topic || "Session focus",
    quickNotes: row.summary || "",
    sessionFocus: row.subject ? [row.subject] : [],
    understandingToday: struggles.length ? "guided" : "mostly-independent",
    effortEngagement: 4,
    keySkillWorkedOn: strengths[0] || "Understanding concepts",
    homeworkStatus: row.homework ? "set-today" : "not-set",
    homeworkDetails: row.homework ?? undefined,
    nextLessonFocus: row.next_steps ? [row.next_steps] : [],
    specificNextFocus: row.next_steps ?? undefined,
    progressRating: struggles.length ? 3 : 4,
    confidenceRating: 3,
    reportTone: "balanced",
    includeInReport: {
      progressRating: true,
      confidenceRating: true,
      homework: true,
      nextSteps: true,
      previousSessionComparison: true,
    },
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function listStudents() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("students")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as StudentRow[]).map(studentRowToChildProfile);
}

export async function getStudent(studentId: string) {
  const client = requireSupabase();
  const { data, error } = await client.from("students").select("*").eq("id", studentId).single();
  if (error) throw error;
  return studentRowToChildProfile(data as StudentRow);
}

export async function findStudentByTutorKey(tutorKey: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("students")
    .select("*")
    .eq("tutor_key", tutorKey.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data ? studentRowToChildProfile(data as StudentRow) : null;
}

export async function upsertStudent(child: ChildProfile) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const now = new Date().toISOString();
  const row = {
    id: child.id || crypto.randomUUID(),
    tutor_id: tutorId,
    full_name: child.fullName,
    preferred_name: child.preferredName || null,
    age: child.age ?? null,
    year_group: child.yearGroup,
    pronouns: child.pronouns || null,
    school: child.school || null,
    subjects: child.subjects,
    exam_board: child.examBoard || null,
    current_grade: child.currentWorkingLevel,
    target_grade: child.targetLevel,
    goals: child.mainGoals || child.longTermGoal || null,
    strengths: child.strengths ?? [],
    struggles: child.struggles ?? [],
    parent_name: child.parentName,
    parent_email: child.parentEmail,
    parent_phone: child.parentPhone || null,
    tutor_key: child.tutorKey,
    status: child.status || "active",
    updated_at: now,
  };

  const { data, error } = await client.from("students").upsert(row, { onConflict: "id" }).select("*").single();
  if (error) throw error;
  return studentRowToChildProfile(data as StudentRow);
}

export async function deleteStudent(studentId: string) {
  const client = requireSupabase();
  const { error } = await client.from("students").delete().eq("id", studentId);
  if (error) throw error;
}

export async function listSessions(studentId?: string) {
  const client = requireSupabase();
  let query = client.from("sessions").select("*").order("session_date", { ascending: false });
  if (studentId) query = query.eq("student_id", studentId);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as SessionRow[]).map(sessionRowToSessionLog);
}

export async function insertSession(session: SessionLog, child: ChildProfile) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const row = {
    id: session.id,
    student_id: child.id,
    tutor_id: tutorId,
    session_date: session.sessionDate,
    subject: session.subject || child.subjects[0] || null,
    topic: session.topic,
    summary: session.quickNotes,
    strengths: [session.keySkillWorkedOn, ...session.sessionFocus].filter(Boolean),
    struggles: child.struggles ?? [],
    homework: session.homeworkDetails || null,
    next_steps: session.specificNextFocus || session.nextLessonFocus.join(", ") || null,
  };

  const { data, error } = await client.from("sessions").upsert(row, { onConflict: "id" }).select("*").single();
  if (error) throw error;
  return sessionRowToSessionLog(data as SessionRow);
}

function reportBody(report: ParentReport) {
  return [
    report.todayFocus,
    "",
    "What went well:",
    ...report.whatWentWell.map((item) => `- ${item}`),
    "",
    `Still needs support: ${report.stillNeedsSupport}`,
    `Homework: ${report.homeworkAssigned}`,
    `Next focus: ${report.nextSessionFocus}`,
    "",
    report.tutorSummary,
  ].join("\n");
}

export async function insertReport(report: ParentReport, session: SessionLog, child: ChildProfile) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const row = {
    id: report.id,
    student_id: child.id,
    tutor_id: tutorId,
    session_id: session.id,
    title: report.title,
    body: JSON.stringify({ parentReport: report, plainText: reportBody(report) }),
    sent_status: "draft",
    sent_to: child.parentEmail || null,
  };

  const { data, error } = await client.from("reports").upsert(row, { onConflict: "id" }).select("*").single();
  if (error) throw error;
  return data as ReportRow;
}

export async function listReports() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("reports")
    .select("*, students(full_name, parent_email), sessions(subject, topic, session_date)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<ReportRow & { students?: { full_name?: string; parent_email?: string }; sessions?: { subject?: string; topic?: string; session_date?: string } }>;
}

export async function getReportBundle(reportId: string) {
  const client = requireSupabase();
  const { data: report, error: reportError } = await client.from("reports").select("*").eq("id", reportId).single();
  if (reportError) throw reportError;

  const reportRow = report as ReportRow;
  const [child, sessions] = await Promise.all([
    getStudent(reportRow.student_id),
    listSessions(reportRow.student_id),
  ]);
  const session = sessions.find((item) => item.id === reportRow.session_id) ?? sessions[0];
  let parentReport: ParentReport | null = null;

  try {
    parentReport = reportRow.body ? JSON.parse(reportRow.body).parentReport : null;
  } catch {
    parentReport = null;
  }

  return { reportRow, parentReport, child, session, sessions };
}
