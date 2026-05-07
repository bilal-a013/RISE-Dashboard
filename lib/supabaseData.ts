import { supabase } from "./supabase";
import { generateTutorKey } from "./tutorKey";
import { generateParentReport } from "./reportGenerator";
import {
  reportSectionsFromParentReport,
  reportSectionsToParentReport,
  reportSectionsToPlainText,
} from "./reportGenerator";
import type {
  ChildProfile,
  ParentReport,
  ReportRow,
  ReportSections,
  SessionLog,
  SessionRow,
  StudentRow,
} from "../types/rise";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
  return supabase;
}

function cleanText(value: string | undefined | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function cleanArray(values: string[] | undefined | null) {
  return (values ?? []).map((item) => item.trim()).filter(Boolean);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isTutorKeyConflict(error: { code?: string; message?: string; details?: string } | null) {
  if (!error) return false;
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return error.code === "23505" && text.includes("tutor_key");
}

function formatSupabaseError(error: { code?: string; message?: string; details?: string; hint?: string } | null) {
  if (!error) return "Could not save profile.";

  const parts = [error.message, error.details, error.hint].filter(Boolean);
  const suffix = parts.length ? ` ${parts.join(" ")}` : "";
  return error.code ? `${error.code}:${suffix}`.trim() : suffix.trim() || "Could not save profile.";
}

async function getExistingTutorKeys(client: ReturnType<typeof requireSupabase>, tutorId: string, excludeStudentId?: string) {
  let query = client.from("students").select("id, tutor_key").eq("tutor_id", tutorId);
  if (excludeStudentId) {
    query = query.neq("id", excludeStudentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return new Set(((data ?? []) as Array<{ tutor_key: string | null }>).map((row) => row.tutor_key?.trim().toUpperCase()).filter(Boolean) as string[]);
}

async function generateUniqueTutorKey(client: ReturnType<typeof requireSupabase>, tutorId: string, fullName: string, excludeStudentId?: string) {
  const existingKeys = await getExistingTutorKeys(client, tutorId, excludeStudentId);
  const baseKey = generateTutorKey(fullName);

  if (!existingKeys.has(baseKey)) {
    return baseKey;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const nextKey = generateTutorKey(fullName);
    if (!existingKeys.has(nextKey)) {
      return nextKey;
    }
  }

  return `${baseKey}${Math.floor(10 + Math.random() * 90)}`;
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
    educationStage: row.education_stage ?? undefined,
    yearGroup: row.year_group || "Year group not set",
    school: row.school ?? undefined,
    subjects: row.subjects ?? [],
    examBoard: row.exam_board ?? undefined,
    currentWorkingLevel: row.current_grade || "Current grade not set",
    targetLevel: row.target_grade || "Target grade not set",
    currentGrade: row.current_grade ?? undefined,
    targetGrade: row.target_grade ?? undefined,
    mainGoals: row.goals ?? undefined,
    mainLearningPriority: row.main_learning_priority ?? row.goals ?? undefined,
    confidenceLevel: 3,
    strengths: row.strengths ?? [],
    struggles: row.struggles ?? [],
    currentTopics: row.current_topics ?? [],
    learningStyle: row.learning_style ?? undefined,
    parentName: row.parent_name || "Parent not set",
    parentRelationship: row.parent_relationship ?? undefined,
    parentEmail: row.parent_email || "",
    parentPhone: row.parent_phone ?? undefined,
    parentReportPreference: (row.parent_report_preference as ChildProfile["parentReportPreference"]) ?? undefined,
    preferredReportMethod: (row.parent_report_preference as ChildProfile["preferredReportMethod"]) ?? undefined,
    currentHomework: row.current_homework ?? undefined,
    homeworkDueDate: row.homework_due_date ?? undefined,
    homeworkStatus: row.homework_status ?? undefined,
    sessionFrequency: row.session_frequency ?? undefined,
    longTermGoal: row.long_term_target ?? undefined,
    longTermTarget: row.long_term_target ?? undefined,
    nextSessionFocus: row.next_session_focus ?? undefined,
    tutorNotes: row.tutor_notes ?? undefined,
    currentHomeWork: row.current_homework ?? undefined,
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
    sessionFocus: row.session_focus ?? (row.subject ? [row.subject] : []),
    understandingToday: (row.understanding_level as SessionLog["understandingToday"]) || (struggles.length ? "guided" : "mostly-independent"),
    effortEngagement: (row.effort_rating as SessionLog["effortEngagement"]) || 4,
    keySkillWorkedOn: row.key_skill || strengths[0] || "Understanding concepts",
    homeworkStatus: row.homework ? "set-today" : "not-set",
    homeworkDetails: row.homework ?? undefined,
    nextLessonFocus: row.next_steps ? [row.next_steps] : [],
    specificNextFocus: row.next_steps ?? undefined,
    progressRating: (row.effort_rating ? Math.min(5, Math.max(1, row.effort_rating)) : struggles.length ? 3 : 4) as SessionLog["progressRating"],
    confidenceRating: (row.confidence_rating ? Math.min(5, Math.max(1, row.confidence_rating)) : 3) as SessionLog["confidenceRating"],
    reportTone: (row.report_tone as SessionLog["reportTone"]) || "balanced",
    includeInReport: {
      progressRating: true,
      confidenceRating: true,
      homework: row.include_in_report ? row.include_in_report.includes("homework") : true,
      nextSteps: row.include_in_report ? row.include_in_report.includes("nextSteps") : true,
      previousSessionComparison: row.include_in_report ? row.include_in_report.includes("previousSessionComparison") : true,
    },
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function listStudents() {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const { data, error } = await client
    .from("students")
    .select("*")
    .eq("tutor_id", tutorId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as StudentRow[]).map(studentRowToChildProfile);
}

export async function getStudent(studentId: string) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const { data, error } = await client.from("students").select("*").eq("id", studentId).eq("tutor_id", tutorId).single();
  if (error) throw error;
  return studentRowToChildProfile(data as StudentRow);
}

export async function findStudentByTutorKey(tutorKey: string) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const { data, error } = await client
    .from("students")
    .select("*")
    .eq("tutor_id", tutorId)
    .eq("tutor_key", tutorKey.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data ? studentRowToChildProfile(data as StudentRow) : null;
}

export async function upsertStudent(child: ChildProfile) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const now = new Date().toISOString();
  const { data: existingStudent, error: existingError } = await client.from("students").select("id").eq("id", child.id).maybeSingle();
  if (existingError && existingError.code !== "PGRST116") {
    throw existingError;
  }
  const isEditing = Boolean(existingStudent);
  const tutorKey = child.tutorKey?.trim().toUpperCase() || (await generateUniqueTutorKey(client, tutorId, child.fullName, child.id));
  const rowBase = {
    id: child.id || crypto.randomUUID(),
    tutor_id: tutorId,
    full_name: child.fullName,
    preferred_name: cleanText(child.preferredName),
    age: child.age ?? null,
    education_stage: cleanText(child.educationStage),
    year_group: child.yearGroup,
    pronouns: cleanText(child.pronouns),
    school: cleanText(child.school),
    subjects: cleanArray(child.subjects),
    exam_board: cleanText(child.examBoard),
    current_grade: child.currentWorkingLevel,
    target_grade: child.targetLevel,
    goals: cleanText(child.mainGoals),
    main_learning_priority: cleanText(child.mainLearningPriority || child.mainGoals),
    strengths: cleanArray(child.strengths),
    struggles: cleanArray(child.struggles),
    current_topics: cleanArray(child.currentTopics),
    learning_style: cleanText(child.learningStyle),
    parent_name: cleanText(child.parentName) || "",
    parent_relationship: cleanText(child.parentRelationship),
    parent_email: cleanText(child.parentEmail) || "",
    parent_phone: cleanText(child.parentPhone),
    parent_report_preference: child.parentReportPreference || child.preferredReportMethod || null,
    current_homework: cleanText(child.currentHomework),
    homework_due_date: cleanText(child.homeworkDueDate) || null,
    homework_status: cleanText(child.homeworkStatus),
    session_frequency: cleanText(child.sessionFrequency),
    long_term_target: cleanText(child.longTermTarget || child.longTermGoal),
    next_session_focus: cleanText(child.nextSessionFocus),
    tutor_notes: cleanText(child.tutorNotes),
    tutor_key: tutorKey,
    status: child.status || "active",
    updated_at: now,
  };

  let nextTutorKey = rowBase.tutor_key;
  let lastError: { code?: string; message?: string; details?: string } | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const row = { ...rowBase, tutor_key: nextTutorKey };
    const query = isEditing ? client.from("students").upsert(row, { onConflict: "id" }) : client.from("students").insert(row);
    const { data, error } = await query.select("*").single();
    if (!error && data) {
      return studentRowToChildProfile(data as StudentRow);
    }

    lastError = error;
    if (isTutorKeyConflict(error) && attempt < 2) {
      nextTutorKey = await generateUniqueTutorKey(client, tutorId, child.fullName, child.id);
      continue;
    }

    throw new Error(formatSupabaseError(error));
  }

  throw new Error(formatSupabaseError(lastError));
}

export async function deleteStudent(studentId: string) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const { error } = await client.from("students").delete().eq("id", studentId).eq("tutor_id", tutorId);
  if (error) throw error;
}

export async function listSessions(studentId?: string) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  let query = client.from("sessions").select("*").eq("tutor_id", tutorId).order("session_date", { ascending: false });
  if (studentId) query = query.eq("student_id", studentId);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as SessionRow[]).map(sessionRowToSessionLog);
}

export async function insertSession(session: SessionLog, child: ChildProfile) {
  const client = requireSupabase();
  const tutorId = child.tutorId || (await getCurrentUserId());
  const sessionId = isUuid(session.id) ? session.id : crypto.randomUUID();
  const sessionDate = cleanText(session.sessionDate) || new Date().toISOString().slice(0, 10);
  const row = {
    id: sessionId,
    student_id: child.id,
    tutor_id: tutorId,
    session_date: sessionDate,
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

export async function updateSession(session: SessionLog, child: ChildProfile) {
  const client = requireSupabase();
  const tutorId = child.tutorId || (await getCurrentUserId());
  const sessionId = isUuid(session.id) ? session.id : crypto.randomUUID();
  const sessionDate = cleanText(session.sessionDate) || new Date().toISOString().slice(0, 10);
  const row = {
    id: sessionId,
    student_id: child.id,
    tutor_id: tutorId,
    session_date: sessionDate,
    subject: session.subject || child.subjects[0] || null,
    topic: session.topic,
    summary: session.quickNotes,
    strengths: [session.keySkillWorkedOn, ...session.sessionFocus].filter(Boolean),
    struggles: child.struggles ?? [],
    homework: session.homeworkDetails || null,
    next_steps: session.specificNextFocus || session.nextLessonFocus.join(", ") || null,
  };

  const { data, error } = await client
    .from("sessions")
    .update(row)
    .eq("id", sessionId)
    .eq("student_id", child.id)
    .eq("tutor_id", tutorId)
    .select("*")
    .single();
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

function parseStoredReportBody(body: string | null) {
  if (!body) return null;
  try {
    return JSON.parse(body) as {
      parentReport?: ParentReport;
      plainText?: string;
      reportSections?: ReportSections;
    };
  } catch {
    return null;
  }
}

function reportRowToSections(row: ReportRow) {
  if (row.report_sections && typeof row.report_sections === "object") {
    return row.report_sections;
  }

  const parsed = parseStoredReportBody(row.body);
  if (parsed?.reportSections) {
    return parsed.reportSections;
  }

  if (parsed?.parentReport) {
    return reportSectionsFromParentReport(parsed.parentReport);
  }

  return null;
}

export async function insertReport(report: ParentReport, session: SessionLog, child: ChildProfile) {
  const client = requireSupabase();
  const tutorId = session.tutorId || child.tutorId || (await getCurrentUserId());
  const reportId = isUuid(report.id) ? report.id : crypto.randomUUID();
  const reportSections = reportSectionsFromParentReport(report, {
    sentStatus: "draft",
    sentTo: child.parentEmail || undefined,
  });
  const row = {
    id: reportId,
    student_id: child.id,
    tutor_id: tutorId,
    session_id: session.id,
    title: report.title,
    body: reportSectionsToPlainText(child, session, report, reportSections),
    report_sections: reportSections,
    sent_status: "draft",
    sent_to: child.parentEmail || null,
  };

  const { data, error } = await client.from("reports").upsert(row, { onConflict: "id" }).select("*").single();
  if (error) throw error;
  return data as ReportRow;
}

export async function updateReport(
  reportId: string,
  updates: Partial<{
    title: string;
    body: string | null;
    report_sections: ReportSections | null;
    sent_status: string | null;
    sent_to: string | null;
    sent_at: string | null;
  }>
) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const row = {
    ...updates,
    sent_to: cleanText(updates.sent_to),
    sent_at: cleanText(updates.sent_at),
  };
  const { error } = await client
    .from("reports")
    .update(row)
    .eq("id", reportId)
    .eq("tutor_id", tutorId);
  if (error) throw error;
  return { id: reportId, ...row } as ReportRow;
}

export async function markReportSent(reportId: string, sentTo?: string | null) {
  return updateReport(reportId, {
    sent_status: "sent",
    sent_to: cleanText(sentTo),
    sent_at: new Date().toISOString(),
  });
}

export async function deleteReport(reportId: string) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const { error } = await client.from("reports").delete().eq("id", reportId).eq("tutor_id", tutorId);
  if (error) throw error;
}

export async function listReports(studentId?: string) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  let query = client
    .from("reports")
    .select("*, students(full_name, parent_email, tutor_key), sessions(subject, topic, session_date)")
    .eq("tutor_id", tutorId)
    .order("created_at", { ascending: false });
  if (studentId) {
    query = query.eq("student_id", studentId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Array<ReportRow & { students?: { full_name?: string; parent_email?: string; tutor_key?: string }; sessions?: { subject?: string; topic?: string; session_date?: string } }>;
}

export async function getReportBundle(reportId: string) {
  const client = requireSupabase();
  const tutorId = await getCurrentUserId();
  const { data: report, error: reportError } = await client.from("reports").select("*").eq("id", reportId).eq("tutor_id", tutorId).single();
  if (reportError) throw reportError;

  const reportRow = report as ReportRow;
  const reportSections = reportRowToSections(reportRow);
  const [child, sessions] = await Promise.all([
    getStudent(reportRow.student_id),
    listSessions(reportRow.student_id),
  ]);
  const session = sessions.find((item) => item.id === reportRow.session_id) ?? sessions[0];
  let parentReport: ParentReport | null = null;

  try {
    const parsed = parseStoredReportBody(reportRow.body);
    parentReport = parsed?.parentReport ?? null;
  } catch {
    parentReport = null;
  }

  if (!parentReport && reportSections && session) {
    parentReport = reportSectionsToParentReport(child, session, reportSections, null);
  }

  if (!parentReport && session) {
    parentReport = generateParentReport(child, session, sessions);
  }

  return { reportRow, parentReport, reportSections, child, session, sessions };
}
