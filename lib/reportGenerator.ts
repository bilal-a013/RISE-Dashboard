import type { ChildProfile, ParentReport, Rating, ReportTone, SessionLog } from "../types/rise";

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
  balanced: "This was a useful session with a clear learning focus and practical next step.",
  encouraging: "This was an encouraging session, with positive signs of growing confidence.",
  direct: "The main outcome is clear: progress was made, and the next priority is targeted practice.",
  detailed: "This session gave a helpful picture of current understanding, confidence, and the next learning priority.",
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
    session.effortEngagement >= 4
      ? "Effort and engagement were strong throughout the session."
      : "Effort was steady, with some prompting needed to maintain pace.",
  ];

  const stillNeedsSupport =
    supportNote ||
    (session.understandingToday === "lots-of-help"
      ? "The core ideas still need careful guided practice before they feel secure."
      : "A short recap next time will help make the learning more automatic.");

  const confidenceUnderstanding =
    session.confidenceRating >= 4
      ? `${child.preferredName || child.fullName} showed good confidence and was able to explain parts of the work independently.`
      : session.confidenceRating === 3
        ? `${child.preferredName || child.fullName} showed steady confidence, especially after examples were modelled.`
        : `${child.preferredName || child.fullName} will benefit from more reassurance and smaller practice steps.`;

  return {
    id: `report-${session.id}`,
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
    tutorSummary: `${toneOpeners[session.reportTone]} ${child.preferredName || child.fullName} is working towards ${child.targetLevel}, and the best next step is ${nextFocus.toLowerCase()}.`,
    generatedAt: new Date().toISOString(),
  };
}
