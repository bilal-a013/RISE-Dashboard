"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Info, KeyRound, Search } from "lucide-react";
import { BrandButton } from "../../components/rise/BrandButton";
import { Card } from "../../components/rise/Card";
import { Footer } from "../../components/rise/Footer";
import { ProgressSegments } from "../../components/rise/ProgressSegments";
import { TopNav } from "../../components/rise/TopNav";
import { findChildByTutorKey, getRiseStore } from "../../lib/localStorageStore";
import { initialsFromName } from "../../lib/tutorKey";
import type { ChildProfile, SessionLog } from "../../types/rise";

export default function TutorKeyPage() {
  const [key, setKey] = useState("RISE-AK47");
  const [child, setChild] = useState<ChildProfile | undefined>();
  const [lastSession, setLastSession] = useState<SessionLog | undefined>();
  const [error, setError] = useState("");

  function loadProfile(value = key) {
    const found = findChildByTutorKey(value);
    if (!found) {
      setError("No child profile found for that Tutor Key. Check the code and try again.");
      setChild(undefined);
      setLastSession(undefined);
      return;
    }
    const store = getRiseStore();
    setError("");
    setChild(found);
    setLastSession(store.sessions.find((session) => session.childId === found.id));
  }

  useEffect(() => {
    loadProfile("RISE-AK47");
  }, []);

  return (
    <main className="min-h-screen bg-[#fcf8ff]">
      <TopNav />
      <div className="mx-auto grid max-w-5xl items-start gap-8 px-6 py-16 md:grid-cols-12">
        <section className="space-y-6 md:col-span-5">
          <div>
            <h1 className="text-3xl font-semibold text-[#1b1b23]">Enter Tutor Key</h1>
            <p className="mt-2 text-lg text-[#464554]">Load a child's tutoring profile.</p>
          </div>
          <Card className="space-y-5">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[#767586]">Access Key</span>
              <input
                value={key}
                onChange={(event) => setKey(event.target.value.toUpperCase())}
                className="h-14 w-full rounded-2xl border-2 border-[#4648d4] bg-[#fcf8ff] px-4 font-mono text-2xl font-black tracking-widest text-[#4648d4] focus:ring-[#4648d4]"
              />
            </label>
            <BrandButton className="w-full" onClick={() => loadProfile()}>
              <Search className="h-4 w-4" />
              Load Child Profile
            </BrandButton>
          </Card>
          <div className="flex items-center gap-3 rounded-xl border border-[#c7c4d7] bg-[#f5f2fe] p-4">
            <Info className="h-5 w-5 text-[#4648d4]" />
            <p className="text-sm leading-6 text-[#464554]">Keys are unique access codes for quickly loading student profiles.</p>
          </div>
          {error ? <p className="rounded-xl bg-[#ffdad6] p-4 text-sm font-semibold text-[#93000a]">{error}</p> : null}
        </section>

        <section className="md:col-span-7">
          {child ? (
            <Card className="relative overflow-hidden">
              <div className="absolute left-0 top-0 h-1 w-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)]" />
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#e1e0ff] text-2xl font-black text-[#4648d4]">
                    {initialsFromName(child.fullName)}
                  </div>
                  <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-[#1b1b23]">{child.fullName}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#e1e0ff] px-3 py-1 text-sm font-semibold text-[#4648d4]">{child.yearGroup}</span>
                    <span className="rounded-full bg-[#f0dbff] px-3 py-1 text-sm font-semibold text-[#8127cf]">Active Student</span>
                  </div>
                </div>
              </div>

              <div className="my-6 grid gap-5 border-y border-[#c7c4d7] py-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase text-[#767586]">Primary subjects</p>
                  <p className="mt-1 font-semibold text-[#1b1b23]">{child.subjects.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-[#767586]">Parent contact</p>
                  <p className="mt-1 font-semibold text-[#4648d4]">{child.parentName} / {child.parentPhone || child.parentEmail}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-[#767586]">
                    Previous session summary
                    <span className="text-[#4648d4]">View Full History <ArrowRight className="inline h-3 w-3" /></span>
                  </p>
                  <div className="rounded-xl bg-[#f5f2fe] p-4">
                    <p className="italic text-[#464554]">"{lastSession?.quickNotes || "No previous session saved yet."}"</p>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm font-semibold text-[#464554]">
                    <span>Overall progress</span>
                    <span>{child.confidenceLevel ?? 3}/5</span>
                  </div>
                  <ProgressSegments value={child.confidenceLevel ?? 3} />
                </div>
                <Link href={`/sessions/new/${child.id}`}>
                  <BrandButton variant="dark" className="mt-4 w-full">
                    <KeyRound className="h-4 w-4" />
                    Log Today's Session
                  </BrandButton>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="flex min-h-80 items-center justify-center text-center">
              <div>
                <KeyRound className="mx-auto h-10 w-10 text-[#767586]" />
                <h2 className="mt-4 text-xl font-semibold">Profile preview</h2>
                <p className="mt-2 text-[#464554]">Enter a Tutor Key to load a child's profile.</p>
              </div>
            </Card>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
