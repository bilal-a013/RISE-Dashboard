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
  fullName: string;
  preferredName?: string;
  age?: number;
  pronouns?: "he/him" | "she/her" | "they/them" | "prefer-not-to-say" | string;
  yearGroup: string;
  school?: string;
  subjects: string[];
  examBoard?: string;
  currentWorkingLevel: string;
  targetLevel: string;
  mainGoals?: string;
  confidenceLevel?: number;
  strengths?: string[];
  struggles?: string[];
  currentTopics?: string[];
  learningStyle?: string;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  preferredReportMethod?: "email" | "whatsapp" | "pdf" | "copy";
  currentHomework?: string;
  upcomingTestDate?: string;
  longTermGoal?: string;
  sessionFrequency?: string;
  tutorNotes?: string;
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

export type RiseStore = {
  tutor: Tutor;
  children: ChildProfile[];
  sessions: SessionLog[];
  reports: ParentReport[];
};
