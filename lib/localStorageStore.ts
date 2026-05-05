import { initialRiseStore } from "./mockRiseData";
import { supabase } from "./supabase";
import type { ChildProfile, ParentReport, RiseStore, SessionLog } from "../types/rise";

const STORE_KEY = "rise-tutoring:mock-store";

function cloneInitialStore(): RiseStore {
  return JSON.parse(JSON.stringify(initialRiseStore)) as RiseStore;
}

export function getRiseStore(): RiseStore {
  if (typeof window === "undefined") return cloneInitialStore();

  const stored = window.localStorage.getItem(STORE_KEY);
  if (!stored) {
    const seeded = cloneInitialStore();
    window.localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(stored) as RiseStore;
    return {
      ...cloneInitialStore(),
      ...parsed,
      children: parsed.children?.length ? parsed.children : cloneInitialStore().children,
      sessions: parsed.sessions ?? [],
      reports: parsed.reports ?? [],
    };
  } catch {
    const seeded = cloneInitialStore();
    window.localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveRiseStore(store: RiseStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export async function syncChildToSupabase(child: ChildProfile) {
  if (!supabase) return { ok: false, message: "Supabase env not configured." };
  const { error } = await supabase.from("children").upsert(child, { onConflict: "id" });
  return error ? { ok: false, message: error.message } : { ok: true, message: "Child saved to Supabase." };
}

export async function syncSessionToSupabase(session: SessionLog) {
  if (!supabase) return { ok: false, message: "Supabase env not configured." };
  const { error } = await supabase.from("sessions").upsert(session, { onConflict: "id" });
  return error ? { ok: false, message: error.message } : { ok: true, message: "Session saved to Supabase." };
}

export async function syncReportToSupabase(report: ParentReport) {
  if (!supabase) return { ok: false, message: "Supabase env not configured." };
  const { error } = await supabase.from("parent_reports").upsert(report, { onConflict: "id" });
  return error ? { ok: false, message: error.message } : { ok: true, message: "Report saved to Supabase." };
}

export function upsertChildProfile(child: ChildProfile): RiseStore {
  const store = getRiseStore();
  const exists = store.children.some((item) => item.id === child.id);
  const children = exists ? store.children.map((item) => (item.id === child.id ? child : item)) : [child, ...store.children];
  const nextStore = { ...store, children };
  saveRiseStore(nextStore);
  return nextStore;
}

export function addSessionLog(session: SessionLog): RiseStore {
  const store = getRiseStore();
  const sessions = [session, ...store.sessions.filter((item) => item.id !== session.id)];
  const nextStore = { ...store, sessions };
  saveRiseStore(nextStore);
  return nextStore;
}

export function addParentReport(report: ParentReport, session?: SessionLog): RiseStore {
  const store = getRiseStore();
  const reports = [report, ...store.reports.filter((item) => item.id !== report.id)];
  const sessions = session
    ? store.sessions.map((item) => (item.id === session.id ? { ...session, parentReport: report } : item))
    : store.sessions;
  const nextStore = { ...store, reports, sessions };
  saveRiseStore(nextStore);
  return nextStore;
}

export function findChildByTutorKey(tutorKey: string): ChildProfile | undefined {
  const normalised = tutorKey.trim().toUpperCase();
  return getRiseStore().children.find((child) => child.tutorKey.toUpperCase() === normalised);
}

export function deleteChildProfile(childId: string): RiseStore {
  const store = getRiseStore();
  const nextStore = {
    ...store,
    children: store.children.filter((child) => child.id !== childId),
    sessions: store.sessions.filter((session) => session.childId !== childId),
    reports: store.reports.filter((report) => report.childId !== childId),
  };
  saveRiseStore(nextStore);
  return nextStore;
}
