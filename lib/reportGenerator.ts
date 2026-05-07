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

export const parentUpdateOpeners: Record<ReportTone, string> = {
  balanced: "Here is a clear summary of today's tutoring session, including strengths and the next steps.",
  encouraging: "Here is a positive update on today's session, with the progress made and the support that will help confidence keep growing.",
  direct: "Here is today's tutoring update, with the main outcomes and the next action points.",
  detailed: "Here is a fuller update on today's session, including what was covered, how the work developed, and the next focus.",
};

const toneTemplates: Record<
  ReportTone,
  {
    positiveFallback: (name: string, skill: string) => string;
    effortStrong: string;
    effortSteady: string;
    supportLots: string;
    supportLight: string;
    confidenceHigh: (name: string) => string;
    confidenceSteady: (name: string) => string;
    confidenceLow: (name: string) => string;
    nextFocus: (nextFocus: string) => string;
  }
> = {
  balanced: {
    positiveFallback: (name, skill) => `${name} engaged well with ${skill.toLowerCase()}.`,
    effortStrong: "Effort and engagement were strong.",
    effortSteady: "Effort was steady.",
    supportLots: "Core ideas still need guided practice.",
    supportLight: "A short recap next time will help consolidate the learning.",
    confidenceHigh: (name) => `${name} showed good confidence and could explain parts of the work.`,
    confidenceSteady: (name) => `${name} showed steady confidence after examples were modelled.`,
    confidenceLow: (name) => `${name} will benefit from smaller practice steps.`,
    nextFocus: (nextFocus) => nextFocus,
  },
  encouraging: {
    positiveFallback: (name, skill) => `${name} kept trying with ${skill.toLowerCase()} and showed encouraging progress as the session developed.`,
    effortStrong: "Effort was strong, and the persistence shown today is a good sign for future sessions.",
    effortSteady: "Effort was steady, with useful moments of focus to build from.",
    supportLots: "Some core ideas still need reassurance and guided practice, but this is a manageable next step.",
    supportLight: "A short confidence-building recap next time will help the learning feel more secure.",
    confidenceHigh: (name) => `${name} showed growing confidence and was able to explain parts of the work with increasing independence.`,
    confidenceSteady: (name) => `${name} showed steady confidence once examples were modelled, which gives us a good base to build on.`,
    confidenceLow: (name) => `${name} will benefit from smaller practice steps and encouragement as the topic becomes more familiar.`,
    nextFocus: (nextFocus) => `Build confidence with ${nextFocus.toLowerCase()}.`,
  },
  direct: {
    positiveFallback: (name, skill) => `${name} worked on ${skill.toLowerCase()} and made progress.`,
    effortStrong: "Effort was strong.",
    effortSteady: "Effort was acceptable, with room for more consistent focus.",
    supportLots: "Core ideas need more guided practice.",
    supportLight: "A short recap is needed before moving on.",
    confidenceHigh: (name) => `${name} showed good confidence and explained parts of the work independently.`,
    confidenceSteady: (name) => `${name} showed steady confidence after modelling.`,
    confidenceLow: (name) => `${name} needs smaller practice steps before working independently.`,
    nextFocus: (nextFocus) => `Next action: ${nextFocus}.`,
  },
  detailed: {
    positiveFallback: (name, skill) => `${name} worked through ${skill.toLowerCase()} and began connecting the method to the wider topic.`,
    effortStrong: "Effort and engagement were strong, especially when applying the method after examples.",
    effortSteady: "Effort was steady, with the best progress coming after guided modelling and repetition.",
    supportLots: "Core ideas still need guided practice, particularly when the question changes format.",
    supportLight: "A short recap next time will help consolidate the learning before extending the topic.",
    confidenceHigh: (name) => `${name} showed good confidence and could explain parts of the work, especially after checking the method against examples.`,
    confidenceSteady: (name) => `${name} showed steady confidence after examples were modelled and benefited from seeing each step clearly.`,
    confidenceLow: (name) => `${name} will benefit from smaller practice steps, repeated examples, and quick checks for understanding.`,
    nextFocus: (nextFocus) => `Next session should focus on ${nextFocus.toLowerCase()}, with time for examples, independent practice, and a short review.`,
  },
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
    reportTone?: ReportTone;
  }
): ReportSections {
  return {
    title: report.title,
    sentStatus: options?.sentStatus,
    sentTo: options?.sentTo,
    priorityTag: options?.priorityTag,
    reportTone: options?.reportTone,
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
  const tone = session.reportTone || "balanced";
  const template = toneTemplates[tone];
  const nextFocusBase = session.specificNextFocus || formatList(session.nextLessonFocus);
  const nextFocus = template.nextFocus(nextFocusBase);
  const homework =
    session.homeworkDetails ||
    (session.homeworkStatus === "not-set"
      ? "No formal homework was set today."
      : "Homework was set to consolidate today's focus.");

  const whatWentWell = [
    positiveNote || template.positiveFallback(child.preferredName || child.fullName, session.keySkillWorkedOn),
    session.effortEngagement >= 4 ? template.effortStrong : template.effortSteady,
  ];

  const stillNeedsSupport =
    supportNote ||
    (session.understandingToday === "lots-of-help"
      ? template.supportLots
      : template.supportLight);

  const confidenceUnderstanding =
    session.confidenceRating >= 4
      ? template.confidenceHigh(child.preferredName || child.fullName)
      : session.confidenceRating === 3
        ? template.confidenceSteady(child.preferredName || child.fullName)
        : template.confidenceLow(child.preferredName || child.fullName);

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
    tutorSummary: `${toneOpeners[tone]} ${child.preferredName || child.fullName} is working towards ${child.targetLevel}. Next: ${nextFocus.toLowerCase()}.`,
    generatedAt: new Date().toISOString(),
  };
}
