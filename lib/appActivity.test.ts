import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  activityEventTitle,
  buildAppActivitySummary,
  formatActivityTimestamp,
  getStudentHomeworkTasksForClient,
  hashTutorKey,
  isRecoverableAppActivityReadError,
  normalizeTutorKey,
} from "./appActivity.ts";

describe("app activity helpers", () => {
  it("normalises and hashes tutor keys the same way as the student app bridge", async () => {
    assert.equal(normalizeTutorKey(" rise-cdx7 "), "RISE-CDX7");
    assert.equal(
      await hashTutorKey(" rise-cdx7 "),
      "c69a975dc80ef867f2046408e14baa80f0d006611d54a272cd7b8e13024c1a6a"
    );
  });

  it("builds readable activity labels when the app only sends an activity type", () => {
    assert.equal(activityEventTitle({ activity_type: "home_viewed", title: "Home opened" }), "Home opened");
    assert.equal(activityEventTitle({ activity_type: "lesson_attempt_started", title: null }), "Lesson attempt started");
  });

  it("formats recent activity timestamps for the dashboard", () => {
    const now = new Date("2026-05-07T20:00:00.000Z");

    assert.equal(
      formatActivityTimestamp("2026-05-07T19:42:00.000Z", now, { timeZone: "UTC" }),
      "Today at 7:42 PM"
    );
    assert.equal(
      formatActivityTimestamp("2026-05-06T19:42:00.000Z", now, { timeZone: "UTC" }),
      "Yesterday at 7:42 PM"
    );
  });

  it("sorts recent activity and exposes last active from the newest event", () => {
    const summary = buildAppActivitySummary({
      childProfileId: "child-profile-1",
      activitySinceLastSession: 2,
      recentActivity: [
        {
          id: "older",
          child_profile_id: "child-profile-1",
          activity_type: "lesson_opened",
          title: null,
          description: null,
          metadata: null,
          created_at: "2026-05-07T18:30:00.000Z",
        },
        {
          id: "newer",
          child_profile_id: "child-profile-1",
          activity_type: "home_viewed",
          title: "Home opened",
          description: null,
          metadata: null,
          created_at: "2026-05-07T19:42:00.000Z",
        },
      ],
      progress: [],
      lessonAttempts: [],
    });

    assert.equal(summary.lastActiveAt, "2026-05-07T19:42:00.000Z");
    assert.deepEqual(
      summary.recentActivity.map((event) => event.id),
      ["newer", "older"]
    );
    assert.equal(summary.progressPlaceholder, "No app progress yet");
    assert.equal(summary.lessonAttemptsPlaceholder, "No lesson attempts yet");
  });

  it("treats missing shared app tables as a recoverable empty state", () => {
    assert.equal(isRecoverableAppActivityReadError({ code: "42P01", message: "relation does not exist" }), true);
    assert.equal(isRecoverableAppActivityReadError({ code: "PGRST205", message: "Could not find the table" }), true);
    assert.equal(isRecoverableAppActivityReadError({ code: "42501", message: "permission denied for table" }), true);
    assert.equal(isRecoverableAppActivityReadError({ code: "PGRST301", message: "JWT expired" }), false);
  });

  it("reads homework tasks through the shared child profile mapping", async () => {
    const calls: Array<{ table: string; filters: Array<[string, string]> }> = [];
    const client = {
      from(table: string) {
        const call = { table, filters: [] as Array<[string, string]> };
        calls.push(call);
        const builder = {
          select() {
            return builder;
          },
          eq(column: string, value: string) {
            call.filters.push([column, value]);
            return builder;
          },
          order() {
            return Promise.resolve({
              data: [
                {
                  id: "homework-1",
                  child_profile_id: "child-profile-1",
                  title: "Algebra confidence practice",
                  instructions: "Spend 10 minutes reviewing the topic your tutor set and mark this when done.",
                  status: "need_help",
                  student_note: "I got stuck on question 3.",
                  due_date: null,
                  completed_at: null,
                  created_at: "2026-05-07T18:30:00.000Z",
                  updated_at: "2026-05-07T19:42:00.000Z",
                },
              ],
              error: null,
            });
          },
        };
        return builder;
      },
    };

    const tasks = await getStudentHomeworkTasksForClient(client, {
      id: "student-1",
      childProfileId: "child-profile-1",
      tutorKey: "RISE-CDX7",
    } as any);

    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].title, "Algebra confidence practice");
    assert.equal(tasks[0].status, "need_help");
    assert.deepEqual(calls.map((call) => call.table), ["homework_tasks"]);
    assert.deepEqual(calls[0].filters, [["child_profile_id", "child-profile-1"]]);
  });

  it("returns an empty homework state when homework_tasks is unavailable", async () => {
    const client = {
      from() {
        const builder = {
          select() {
            return builder;
          },
          eq() {
            return builder;
          },
          order() {
            return Promise.resolve({
              data: null,
              error: { code: "42P01", message: "relation does not exist" },
            });
          },
        };
        return builder;
      },
    };

    const tasks = await getStudentHomeworkTasksForClient(client, {
      id: "student-1",
      childProfileId: "child-profile-1",
      tutorKey: "RISE-CDX7",
    } as any);

    assert.deepEqual(tasks, []);
  });
});
