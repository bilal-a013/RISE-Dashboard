"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, PersonStanding, Search, Sparkles } from "lucide-react";
import { BrandButton } from "../../components/rise/BrandButton";
import { Card } from "../../components/rise/Card";
import { Footer } from "../../components/rise/Footer";
import { StudentProfileCard } from "../../components/rise/StudentProfileCard";
import { TopNav } from "../../components/rise/TopNav";
import { deleteChildProfile, getRiseStore } from "../../lib/localStorageStore";
import type { RiseStore } from "../../types/rise";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [store, setStore] = useState<RiseStore | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setStore(getRiseStore());
  }, []);

  const children = useMemo(() => {
    const all = store?.children ?? [];
    return all.filter((child) => `${child.fullName} ${child.subjects.join(" ")} ${child.tutorKey}`.toLowerCase().includes(query.toLowerCase()));
  }, [query, store]);

  return (
    <main className="min-h-screen bg-[#fcf8ff]">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#1b1b23]">Welcome back</h1>
            <p className="mt-2 text-lg text-[#464554]">You have 4 sessions scheduled for today across 2 students.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/tutor-key">
              <BrandButton variant="secondary">
                <KeyRound className="h-4 w-4" />
                Enter Tutor Key
              </BrandButton>
            </Link>
            <Link href="/students/new">
              <BrandButton>
                <PersonStanding className="h-4 w-4" />
                Create Child Profile
              </BrandButton>
            </Link>
          </div>
        </section>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#767586]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search child profiles..."
            className="h-12 w-full rounded-2xl border-[#c7c4d7] bg-white pl-12 pr-4 focus:border-[#4648d4] focus:ring-[#4648d4]"
          />
        </div>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <StudentProfileCard
              key={child.id}
              child={child}
              lastSession={store?.sessions.find((session) => session.childId === child.id)}
              onEdit={() => router.push(`/students/new?childId=${child.id}`)}
              onRemove={() => {
                if (!confirm(`Remove ${child.fullName}? This also deletes their sessions and reports locally.`)) return;
                const nextStore = deleteChildProfile(child.id);
                setStore(nextStore);
              }}
            />
          ))}

          <Card className="flex min-h-[24rem] flex-col justify-between border-[#6063ee] bg-[#6063ee] text-white">
            <div>
              <Sparkles className="mb-5 h-8 w-8" />
              <h2 className="text-2xl font-semibold">AI Progress Insights</h2>
              <p className="mt-3 leading-7 text-white/85">
                Our new cognitive analysis tools help you track student burnout risks before they happen.
              </p>
            </div>
            <div className="space-y-3">
              <BrandButton variant="secondary" className="w-full border-white bg-white text-[#4648d4]">
                Try Insights
              </BrandButton>
              <BrandButton variant="secondary" className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20">
                View Tutorial
              </BrandButton>
            </div>
          </Card>
        </section>
      </div>
      <Footer />
    </main>
  );
}
