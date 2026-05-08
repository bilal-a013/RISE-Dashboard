import type {
  ChildProfile,
  HomeworkTaskRow,
  LessonAttemptRow,
  StudentAppActivityRow,
  StudentAppActivitySummary,
  StudentProgressRow,
} from "../types/rise";

type SupabaseClientLike = {
  from: (table: string) => any;
};

type SupabaseErrorLike = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

type ActivityTimestampOptions = {
  locale?: string;
  timeZone?: string;
};

const RECOVERABLE_READ_ERROR_CODES = new Set(["42P01", "42703", "42501", "PGRST200", "PGRST205"]);

export function normalizeTutorKey(tutorKey: string) {
  return tutorKey.trim().toUpperCase();
}

export async function hashTutorKey(tutorKey: string) {
  const normalized = normalizeTutorKey(tutorKey);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isRecoverableAppActivityReadError(error: SupabaseErrorLike | null | undefined) {
  if (!error) return false;
  const code = error.code ?? "";
  const message = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();

  return (
    RECOVERABLE_READ_ERROR_CODES.has(code) ||
    message.includes("relation does not exist") ||
    message.includes("could not find the table") ||
    message.includes("column") && message.includes("does not exist") ||
    message.includes("permission denied for table")
  );
}

export function activityEventTitle(event: Pick<StudentAppActivityRow, "activity_type" | "title">) {
  const title = event.title?.trim();
  if (title) return title;

  const fallback = event.activity_type
    .split("_")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return fallback ? fallback.charAt(0).toUpperCase() + fallback.slice(1) : "App activity";
}

function timestampValue(value: string | null | undefined) {
  const time = Date.parse(value ?? "");
  return Number.isFinite(time) ? time : 0;
}

function dateKey(date: Date, locale: string, timeZone?: string) {
  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatTime(date: Date, locale: string, timeZone?: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone,
  })
    .format(date)
    .replace(/\b(am|pm)\b/gi, (match) => match.toUpperCase());
}

export function formatActivityTimestamp(
  value: string | null | undefined,
  now = new Date(),
  options: ActivityTimestampOptions = {}
) {
  if (!value) return "Not active yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not active yet";

  const locale = options.locale ?? "en-GB";
  const today = dateKey(now, locale, options.timeZone);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dateKey(yesterdayDate, locale, options.timeZone);
  const activityDay = dateKey(date, locale, options.timeZone);
  const time = formatTime(date, locale, options.timeZone);

  if (activityDay === today) return `Today at ${time}`;
  if (activityDay === yesterday) return `Yesterday at ${time}`;

  const dateLabel = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: options.timeZone,
  }).format(date);
  return `${dateLabel} at ${time}`;
}

export function buildAppActivitySummary({
  childProfileId,
  recentActivity,
  activitySinceLastSession,
  progress,
  lessonAttempts,
  unavailableReason,
}: {
  childProfileId: string | null;
  recentActivity: StudentAppActivityRow[];
  activitySinceLastSession: number | null;
  progress: StudentProgressRow[];
  lessonAttempts: LessonAttemptRow[];
  unavailableReason?: string;
}): StudentAppActivitySummary {
  const sortedActivity = [...recentActivity].sort((left, right) => timestampValue(right.created_at) - timestampValue(left.created_at));

  return {
    childProfileId,
    lastActiveAt: sortedActivity[0]?.created_at ?? null,
    recentActivity: sortedActivity,
    activitySinceLastSession,
    progress,
    lessonAttempts,
    progressPlaceholder: progress.length ? `${progress.length} progress ${progress.length === 1 ? "update" : "updates"}` : "No app progress yet",
    lessonAttemptsPlaceholder: lessonAttempts.length ? `${lessonAttempts.length} lesson ${lessonAttempts.length === 1 ? "attempt" : "attempts"}` : "No lesson attempts yet",
    unavailableReason,
  };
}

export function emptyAppActivitySummary(unavailableReason?: string): StudentAppActivitySummary {
  return buildAppActivitySummary({
    childProfileId: null,
    recentActivity: [],
    activitySinceLastSession: null,
    progress: [],
    lessonAttempts: [],
    unavailableReason,
  });
}

export async function resolveChildProfileId(client: SupabaseClientLike, student: ChildProfile) {
  if (student.childProfileId) return student.childProfileId;

  if (student.tutorKey) {
    try {
      const keyHash = await hashTutorKey(student.tutorKey);
      const { data, error } = await client
        .from("tutor_keys")
        .select("child_profile_id")
        .eq("key_hash", keyHash)
        .maybeSingle();

      if (error) {
        if (!isRecoverableAppActivityReadError(error)) throw error;
      } else if ((data as { child_profile_id?: string | null } | null)?.child_profile_id) {
        return (data as { child_profile_id: string }).child_profile_id;
      }
    } catch (error) {
      if (!isRecoverableAppActivityReadError(error as SupabaseErrorLike)) throw error;
    }
  }

  const { data, error } = await client
    .from("child_profiles")
    .select("id")
    .eq("id", student.id)
    .maybeSingle();

  if (error) {
    if (isRecoverableAppActivityReadError(error)) return null;
    throw error;
  }

  return (data as { id?: string | null } | null)?.id ?? null;
}

async function readHomeworkTasks(client: SupabaseClientLike, childProfileId: string) {
  const { data, error } = await client
    .from("homework_tasks")
    .select("id, child_profile_id, title, instructions, status, student_note, due_date, completed_at, created_at, updated_at")
    .eq("child_profile_id", childProfileId)
    .order("updated_at", { ascending: false });

  if (error) {
    if (isRecoverableAppActivityReadError(error)) return [];
    throw error;
  }

  return (data ?? []) as HomeworkTaskRow[];
}

export async function getStudentHomeworkTasksForClient(client: SupabaseClientLike, student: ChildProfile) {
  const childProfileId = await resolveChildProfileId(client, student);
  if (!childProfileId) return [];
  return readHomeworkTasks(client, childProfileId);
}

export async function getStudentHomeworkTasks(student: ChildProfile): Promise<HomeworkTaskRow[]> {
  const { supabase } = await import("./supabase");

  if (!supabase) return [];

  try {
    return await getStudentHomeworkTasksForClient(supabase, student);
  } catch (error) {
    if (isRecoverableAppActivityReadError(error as SupabaseErrorLike)) return [];
    return [];
  }
}

async function readRecentActivity(client: SupabaseClientLike, childProfileId: string) {
  const { data, error } = await client
    .from("student_app_activity")
    .select("id, child_profile_id, activity_type, title, description, metadata, created_at")
    .eq("child_profile_id", childProfileId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    if (isRecoverableAppActivityReadError(error)) return [];
    throw error;
  }

  return (data ?? []) as StudentAppActivityRow[];
}

async function countActivitySinceLastSession(
  client: SupabaseClientLike,
  childProfileId: string,
  latestSessionDate?: string | null
) {
  if (!latestSessionDate) return null;

  const since = new Date(`${latestSessionDate.slice(0, 10)}T00:00:00.000Z`).toISOString();
  const { count, error } = await client
    .from("student_app_activity")
    .select("id", { count: "exact", head: true })
    .eq("child_profile_id", childProfileId)
    .gte("created_at", since);

  if (error) {
    if (isRecoverableAppActivityReadError(error)) return null;
    throw error;
  }

  return count ?? 0;
}

async function readRecentProgress(client: SupabaseClientLike, childProfileId: string) {
  const { data, error } = await client
    .from("student_progress")
    .select("id, child_profile_id, subject, topic, skill, status, confidence_level, score, attempts, last_practised_at, updated_at, created_at")
    .eq("child_profile_id", childProfileId)
    .order("updated_at", { ascending: false })
    .limit(3);

  if (error) {
    if (isRecoverableAppActivityReadError(error)) return [];
    throw error;
  }

  return (data ?? []) as StudentProgressRow[];
}

async function readRecentLessonAttempts(client: SupabaseClientLike, childProfileId: string) {
  const { data, error } = await client
    .from("lesson_attempts")
    .select("id, child_profile_id, lesson_id, subject, topic, activity_title, score, total_questions, correct_answers, time_spent_seconds, weak_areas, completed_at, metadata")
    .eq("child_profile_id", childProfileId)
    .order("completed_at", { ascending: false })
    .limit(3);

  if (error) {
    if (isRecoverableAppActivityReadError(error)) return [];
    throw error;
  }

  return (data ?? []) as LessonAttemptRow[];
}

export async function getStudentAppActivitySummary(
  student: ChildProfile,
  latestSessionDate?: string | null
): Promise<StudentAppActivitySummary> {
  const { supabase } = await import("./supabase");

  if (!supabase) {
    return emptyAppActivitySummary("Supabase is not configured.");
  }

  try {
    const childProfileId = await resolveChildProfileId(supabase, student);
    if (!childProfileId) return emptyAppActivitySummary();

    const [recentActivity, activitySinceLastSession, progress, lessonAttempts] = await Promise.all([
      readRecentActivity(supabase, childProfileId),
      countActivitySinceLastSession(supabase, childProfileId, latestSessionDate),
      readRecentProgress(supabase, childProfileId),
      readRecentLessonAttempts(supabase, childProfileId),
    ]);

    return buildAppActivitySummary({
      childProfileId,
      recentActivity,
      activitySinceLastSession,
      progress,
      lessonAttempts,
    });
  } catch (error) {
    if (isRecoverableAppActivityReadError(error as SupabaseErrorLike)) {
      return emptyAppActivitySummary("App activity is not available in this environment yet.");
    }

    return emptyAppActivitySummary("App activity could not be loaded right now.");
  }
}
