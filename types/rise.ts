export type Rating = 1 | 2 | 3 | 4 | 5;

export type Tutor = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
};

export type ChildProfile = {
  id: string;
  tutorKey: string;
  childProfileId?: string;
  tutorId?: string;
  fullName: string;
  preferredName?: string;
  age?: number;
  pronouns?: "he/him" | "she/her" | "they/them" | "prefer-not-to-say" | string;
  educationStage?: "Primary" | "KS3" | "GCSE" | string;
  yearGroup: string;
  school?: string;
  subjects: string[];
  examBoard?: string;
  currentWorkingLevel: string;
  targetLevel: string;
  mainGoals?: string;
  mainLearningPriority?: string;
  confidenceLevel?: number;
  strengths?: string[];
  struggles?: string[];
  currentTopics?: string[];
  learningStyle?: string;
  parentName: string;
  parentRelationship?: string;
  parentEmail: string;
  parentPhone?: string;
  preferredReportMethod?: "email" | "whatsapp" | "pdf" | "copy";
  parentReportPreference?: "email" | "whatsapp" | "pdf" | "copy";
  currentHomework?: string;
  homeworkDueDate?: string;
  homeworkStatus?: string;
  longTermGoal?: string;
  longTermTarget?: string;
  sessionFrequency?: string;
  nextSessionFocus?: string;
  tutorNotes?: string;
  currentGrade?: string;
  targetGrade?: string;
  currentHomeWork?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
};

export type UnderstandingToday = "lots-of-help" | "guided" | "mostly-independent" | "secure";
export type HomeworkStatus = "not-set" | "set-today" | "reviewed-today" | "incomplete" | "completed";
export type ReportTone = "balanced" | "encouraging" | "direct" | "detailed";

export type SessionLog = {
  id: string;
  childId: string;
  tutorId: string;
  sessionDate: string;
  subject?: string;
  topic: string;
  quickNotes: string;
  sessionFocus: string[];
  understandingToday: UnderstandingToday;
  effortEngagement: Rating;
  keySkillWorkedOn: string;
  homeworkStatus: HomeworkStatus;
  homeworkDetails?: string;
  nextLessonFocus: string[];
  specificNextFocus?: string;
  progressRating: Rating;
  confidenceRating: Rating;
  reportTone: ReportTone;
  includeInReport: {
    progressRating: boolean;
    confidenceRating: boolean;
    homework: boolean;
    nextSteps: boolean;
    previousSessionComparison: boolean;
  };
  parentReport?: ParentReport;
  internalTutorNote?: string;
  createdAt: string;
};

export type ParentReport = {
  id: string;
  childId: string;
  sessionLogId: string;
  title: string;
  todayFocus: string;
  whatWentWell: string[];
  stillNeedsSupport: string;
  confidenceUnderstanding: string;
  homeworkAssigned: string;
  nextSessionFocus: string;
  progressSnapshot: {
    progressRating: number;
    progressLabel: string;
    confidenceRating: number;
    confidenceLabel: string;
    currentWorkingLevel: string;
    targetLevel: string;
    previousSessionComparison: string;
  };
  tutorSummary: string;
  generatedAt: string;
};

export type ReportSections = {
  title?: string;
  sentStatus?: string;
  sentTo?: string;
  priorityTag?: string;
  reportTone?: ReportTone;
  todayFocus?: string;
  whatWentWell?: string;
  stillNeedsSupport?: string;
  confidence?: string;
  homework?: string;
  nextFocus?: string;
  tutorSummary?: string;
};

export type RiseStore = {
  tutor: Tutor;
  children: ChildProfile[];
  sessions: SessionLog[];
  reports: ParentReport[];
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
};

export type StudentRow = {
  id: string;
  child_profile_id?: string | null;
  tutor_id: string;
  full_name: string;
  preferred_name: string | null;
  age: number | null;
  education_stage: string | null;
  year_group: string | null;
  pronouns: string | null;
  school: string | null;
  subjects: string[] | null;
  exam_board: string | null;
  current_grade: string | null;
  target_grade: string | null;
  goals: string | null;
  main_learning_priority: string | null;
  strengths: string[] | null;
  struggles: string[] | null;
  current_topics: string[] | null;
  learning_style: string | null;
  parent_name: string | null;
  parent_relationship: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  parent_report_preference: string | null;
  current_homework: string | null;
  homework_due_date: string | null;
  homework_status: string | null;
  session_frequency: string | null;
  long_term_target: string | null;
  next_session_focus: string | null;
  tutor_notes: string | null;
  tutor_key: string;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SessionRow = {
  id: string;
  student_id: string;
  tutor_id: string;
  session_date: string;
  subject: string | null;
  topic: string | null;
  summary: string | null;
  strengths: string[] | null;
  struggles: string[] | null;
  homework: string | null;
  next_steps: string | null;
  understanding_level?: string | null;
  effort_rating?: number | null;
  confidence_rating?: number | null;
  session_focus?: string[] | null;
  key_skill?: string | null;
  report_tone?: string | null;
  include_in_report?: string[] | null;
  created_at: string | null;
};

export type ReportRow = {
  id: string;
  student_id: string;
  tutor_id: string;
  session_id: string | null;
  title: string;
  body: string | null;
  report_sections?: ReportSections | null;
  sent_status: string | null;
  sent_to: string | null;
  sent_at: string | null;
  created_at: string | null;
};

export type ParentReplyRow = {
  id: string;
  student_id: string;
  report_id: string | null;
  parent_email: string | null;
  subject: string | null;
  body: string | null;
  received_at: string | null;
  gmail_thread_id: string | null;
};

export type StudentAppActivityRow = {
  id: string;
  child_profile_id: string;
  activity_type: string;
  title: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

export type HomeworkTaskStatus = "not_started" | "in_progress" | "completed" | "need_help";

export type HomeworkTaskRow = {
  id: string;
  child_profile_id: string;
  title: string;
  instructions: string | null;
  status: HomeworkTaskStatus;
  student_note: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type StudentProgressRow = {
  id: string;
  child_profile_id: string;
  subject: string | null;
  topic: string | null;
  skill: string | null;
  status: string | null;
  confidence_level: string | null;
  score: number | null;
  attempts: number | null;
  last_practised_at: string | null;
  updated_at: string | null;
  created_at: string | null;
};

export type LessonAttemptRow = {
  id: string;
  child_profile_id: string;
  lesson_id: string | null;
  subject: string | null;
  topic: string | null;
  activity_title: string | null;
  score: number | null;
  total_questions: number | null;
  correct_answers: number | null;
  time_spent_seconds: number | null;
  weak_areas: string[] | null;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
};

export type StudentAppActivitySummary = {
  childProfileId: string | null;
  lastActiveAt: string | null;
  recentActivity: StudentAppActivityRow[];
  activitySinceLastSession: number | null;
  progress: StudentProgressRow[];
  lessonAttempts: LessonAttemptRow[];
  progressPlaceholder: string;
  lessonAttemptsPlaceholder: string;
  unavailableReason?: string;
};
