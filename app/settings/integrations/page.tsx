"use client";

import Link from "next/link";
import { ChevronRight, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { ProtectedContent } from "../../../components/rise/AuthProvider";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Card } from "../../../components/rise/Card";
import { Footer } from "../../../components/rise/Footer";
import { TopNav } from "../../../components/rise/TopNav";

export default function IntegrationsSettingsPage() {
  return (
    <ProtectedContent>
      <main className="min-h-screen bg-[#fcf8ff] animate-rise-page dark:bg-slate-950">
        <TopNav />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <header className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-[#4648d4] dark:text-[#c0c1ff]">Settings</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#1b1b23] dark:text-slate-50">Integrations</h1>
            <p className="mt-2 text-lg text-[#464554] dark:text-slate-300">Prepare RISE Dashboard for Gmail and other future integrations.</p>
          </header>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="space-y-4 lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-[#f5f2fe] p-3 text-[#4648d4] dark:bg-slate-900 dark:text-[#c0c1ff]">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-[#1b1b23] dark:text-slate-50">Google / Gmail</h2>
                    <span className="rounded-full border border-[#c7c4d7] bg-[#f5f2fe] px-3 py-1 text-xs font-bold text-[#464554] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      Not connected
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#464554] dark:text-slate-300">
                    Future use: send polished parent reports, track parent replies, and link messages back to students and report IDs.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#e9e6f3] bg-[#fcf8ff] p-4 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#767586] dark:text-slate-400">Status</p>
                  <p className="mt-2 text-sm font-semibold text-[#1b1b23] dark:text-slate-100">Coming soon</p>
                </div>
                <div className="rounded-2xl border border-[#e9e6f3] bg-[#fcf8ff] p-4 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#767586] dark:text-slate-400">Business Gmail</p>
                  <p className="mt-2 text-sm font-semibold text-[#1b1b23] dark:text-slate-100">risetutoringluton@gmail.com</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <BrandButton disabled className="opacity-60">
                  Connect Google - Coming Soon
                </BrandButton>
                <Link href="/reports">
                  <BrandButton variant="secondary">Back to Reports</BrandButton>
                </Link>
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#8127cf] dark:text-[#c0c1ff]" />
                <h2 className="text-xl font-semibold text-[#1b1b23] dark:text-slate-50">Planned use</h2>
              </div>
              <ul className="space-y-3 text-sm leading-6 text-[#464554] dark:text-slate-300">
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#4648d4] dark:text-[#c0c1ff]" />
                  OAuth-based Gmail connection only, with server-side token handling.
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 text-[#4648d4] dark:text-[#c0c1ff]" />
                  Send report emails and optionally attach the PDF later.
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 text-[#4648d4] dark:text-[#c0c1ff]" />
                  Match replies via parent email, report ID, Tutor Key or Gmail thread ID.
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 text-[#4648d4] dark:text-[#c0c1ff]" />
                  Store matched replies in `parent_replies` for the Reports tab.
                </li>
              </ul>
            </Card>
          </div>
        </div>
        <Footer />
      </main>
    </ProtectedContent>
  );
}
