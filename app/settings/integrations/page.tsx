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
      <main className="rise-page min-h-screen animate-rise-page">
        <TopNav />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <header className="mb-6 sm:mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--rise-purple)]">Settings</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--rise-heading)]">Integrations</h1>
            <p className="mt-2 text-base text-[var(--rise-text-muted)] sm:text-lg">Prepare RISE Dashboard for Gmail and other future integrations.</p>
          </header>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="space-y-5 lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-[var(--rise-surface-soft)] p-3 text-[var(--rise-purple)]">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-[var(--rise-heading)]">Google / Gmail</h2>
                    <span className="rounded-full border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] px-3 py-1 text-xs font-bold text-[var(--rise-text-muted)]">
                      Not connected
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--rise-text-muted)]">
                    Future use: send polished parent reports, track parent replies, and link messages back to students and report IDs.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--rise-text-soft)]">Status</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--rise-heading)]">Coming soon</p>
                </div>
                <div className="rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--rise-text-soft)]">Business Gmail</p>
                  <p className="mt-2 break-all text-sm font-semibold text-[var(--rise-heading)]">risetutoringluton@gmail.com</p>
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
                <Sparkles className="h-5 w-5 text-[var(--rise-purple)]" />
                <h2 className="text-xl font-semibold text-[var(--rise-heading)]">Planned use</h2>
              </div>
              <ul className="space-y-3 text-sm leading-6 text-[var(--rise-text-muted)]">
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rise-purple)]" />
                  OAuth-based Gmail connection only, with server-side token handling.
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rise-purple)]" />
                  Send report emails and optionally attach the PDF later.
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rise-purple)]" />
                  Match replies via parent email, report ID, Tutor Key or Gmail thread ID.
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rise-purple)]" />
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
