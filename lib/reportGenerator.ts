import type { ChildProfile, ParentReport, Rating, ReportSections, ReportTone, SessionLog } from "../types/rise";

export const progressLabels: Record<Rating, string> = {
  1: "Needs support",
  2: "Building basics",
  3: "Getting there",
  4: "Confident",
  5: "Strong progress",
};

export const confidenceLabels: Record<Rating, string> = {
  1: "Low",
  2: "Slight",
  3: "Steady",
  4: "Good",
  5: "High",
};

const toneOpeners: Record<ReportTone, string> = {
  balanced: "A clear session with a practical next step.",
  encouraging: "A positive session with growing confidence.",
  direct: "Progress was made. The next priority is targeted practice.",
  detailed: "A useful session with clear understanding and next steps.",
};

function splitSentences(notes: string) {
  return notes
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function firstMatching(notes: string, words: string[]) {
  return splitSentences(notes).find((sentence) => words.some((word) => sentence.toLowerCase().includes(word)));
}

function formatList(values: string[]) {
  if (!values.length) return "today's focus";
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;
}

function confidenceToSentence(value?: string) {
  const confidence = (value ?? "").toLowerCase();
  if (confidence.startsWith("low")) return "Confidence was low and the next step is more guided practice.";
  if (confidence.startsWith("develop") || confidence.startsWith("slight")) return "Confidence is developing with support and repetition.";
  if (confidence.startsWith("steady")) return "Confidence was steady after examples were modelled.";
  if (confidence.startsWith("good")) return "Confidence was good and the student worked independently for parts of the session.";
  if (confidence.startsWith("high")) return "Confidence was high and the student worked independently with clear understanding.";
  if (confidence.startsWith("strong")) return "Confidence was strong and the student worked independently with clear understanding.";
  return value || "Confidence is still building.";
}

function confidenceToSelection(value?: string) {
  const confidence = (value ?? "").toLowerCase();
  if (confidence.startsWith("low")) return "Low";
  if (confidence.startsWith("slight")) return "Developing";
  if (confidence.startsWith("steady")) return "Steady";
  if (confidence.startsWith("good")) return "Good";
  if (confidence.startsWith("high") || confidence.startsWith("strong")) return "Strong";
  return value || "Steady";
}

function splitIntoPoints(value?: string) {
  return (value ?? "")
    .split(/\n+/)
    .map((part) => part.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function reportSectionsFromParentReport(
  report: ParentReport,
  options?: {
    sentStatus?: string;
    sentTo?: string;
    priorityTag?: string;
  }
): ReportSections {
  return {
    title: report.title,
    sentStatus: options?.sentStatus,
    sentTo: options?.sentTo,
    priorityTag: options?.priorityTag,
    todayFocus: report.todayFocus,
    whatWentWell: report.whatWentWell.join("\n"),
    stillNeedsSupport: report.stillNeedsSupport,
    confidence: confidenceToSelection(report.progressSnapshot.confidenceLabel),
    homework: report.homeworkAssigned,
    nextFocus: report.nextSessionFocus,
    tutorSummary: report.tutorSummary,
  };
}

export function reportSectionsToParentReport(
  child: ChildProfile,
  session: SessionLog,
  sections: ReportSections,
  fallback?: ParentReport | null
): ParentReport {
  const generatedFallback = fallback ?? generateParentReport(child, session, [session]);
  const whatWentWell = splitIntoPoints(sections.whatWentWell).length ? splitIntoPoints(sections.whatWentWell) : generatedFallback.whatWentWell;
  return {
    ...generatedFallback,
    title: sections.title?.trim() || generatedFallback.title,
    todayFocus: sections.todayFocus?.trim() || generatedFallback.todayFocus,
    whatWentWell,
    stillNeedsSupport: sections.stillNeedsSupport?.trim() || generatedFallback.stillNeedsSupport,
    confidenceUnderstanding: confidenceToSentence(sections.confidence) || generatedFallback.confidenceUnderstanding,
    homeworkAssigned: sections.homework?.trim() || generatedFallback.homeworkAssigned,
    nextSessionFocus: sections.nextFocus?.trim() || generatedFallback.nextSessionFocus,
    tutorSummary: sections.tutorSummary?.trim() || generatedFallback.tutorSummary,
  };
}

export function reportSectionsToPlainText(
  child: ChildProfile,
  session: SessionLog,
  report: ParentReport,
  sections?: ReportSections
) {
  const title = sections?.title?.trim() || report.title;
  const priority = sections?.priorityTag?.trim();
  return [
    title,
    priority ? `Priority: ${priority}` : null,
    "",
    `Student: ${child.fullName}`,
    `Date: ${new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(session.sessionDate))}`,
    `Topic: ${session.topic}`,
    `Current level: ${report.progressSnapshot.currentWorkingLevel} → ${report.progressSnapshot.targetLevel}`,
    "",
    `Today's focus: ${report.todayFocus}`,
    `What went well: ${report.whatWentWell.join(" • ")}`,
    `Still needs support: ${report.stillNeedsSupport}`,
    `Confidence: ${report.confidenceUnderstanding}`,
    `Homework: ${report.homeworkAssigned}`,
    `Next focus: ${report.nextSessionFocus}`,
    "",
    `Tutor summary: ${report.tutorSummary}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateParentReport(
  child: ChildProfile,
  session: SessionLog,
  previousSessions: SessionLog[]
): ParentReport {
  // TODO: Replace this deterministic generator with real AI summarisation once provider choice is final.
  const firstNote = splitSentences(session.quickNotes)[0];
  const positiveNote = firstMatching(session.quickNotes, ["improved", "confident", "secure", "independent", "accurate"]);
  const supportNote = firstMatching(session.quickNotes, ["struggled", "support", "tricky", "uncertain", "error", "mistake"]);
  const previous = previousSessions.find((item) => item.id !== session.id);
  const progressLabel = progressLabels[session.progressRating];
  const confidenceLabel = confidenceLabels[session.confidenceRating];
  const nextFocus = session.specificNextFocus || formatList(session.nextLessonFocus);
  const homework =
    session.homeworkDetails ||
    (session.homeworkStatus === "not-set"
      ? "No formal homework was set today."
      : "Homework was set to consolidate today's focus.");

  const whatWentWell = [
    positiveNote || `${child.preferredName || child.fullName} engaged well with ${session.keySkillWorkedOn.toLowerCase()}.`,
    session.effortEngagement >= 4 ? "Effort and engagement were strong." : "Effort was steady.",
  ];

  const stillNeedsSupport =
    supportNote ||
    (session.understandingToday === "lots-of-help"
      ? "Core ideas still need guided practice."
      : "A short recap next time will help consolidate the learning.");

  const confidenceUnderstanding =
    session.confidenceRating >= 4
      ? `${child.preferredName || child.fullName} showed good confidence and could explain parts of the work.`
      : session.confidenceRating === 3
        ? `${child.preferredName || child.fullName} showed steady confidence after examples were modelled.`
        : `${child.preferredName || child.fullName} will benefit from smaller practice steps.`;

  return {
    id: crypto.randomUUID(),
    childId: child.id,
    sessionLogId: session.id,
    title: `${child.fullName} Session Report`,
    todayFocus: firstNote || `Today focused on ${session.topic}.`,
    whatWentWell,
    stillNeedsSupport,
    confidenceUnderstanding,
    homeworkAssigned: homework,
    nextSessionFocus: nextFocus,
    progressSnapshot: {
      progressRating: session.progressRating,
      progressLabel,
      confidenceRating: session.confidenceRating,
      confidenceLabel,
      currentWorkingLevel: child.currentWorkingLevel,
      targetLevel: child.targetLevel,
      previousSessionComparison: previous
        ? `Compared with ${previous.topic}, this session showed ${session.progressRating >= previous.progressRating ? "stronger momentum" : "a need for more consolidation"}.`
        : "This is the first stored comparison point for this child.",
    },
    tutorSummary: `${toneOpeners[session.reportTone]} ${child.preferredName || child.fullName} is working towards ${child.targetLevel}. Next: ${nextFocus.toLowerCase()}.`,
    generatedAt: new Date().toISOString(),
  };
}
