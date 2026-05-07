"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Footer } from "../../../components/rise/Footer";
import { useToast } from "../../../components/rise/ToastProvider";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import { upsertProfile } from "../../../lib/supabaseData";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setStatus("Supabase is not configured yet. Add your environment variables and restart the dev server.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
          if (data.session && data.user) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
            if (sessionError) throw sessionError;
            await upsertProfile(fullName || email, email);
            toast({ title: "Login successful", description: "Welcome back to RISE Dashboard.", variant: "success" });
            router.push("/dashboard");
            return;
          }
        setStatus("Account created. Check your email to confirm the account, then log in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          await upsertProfile(data.user.user_metadata?.full_name || fullName || email, email);
        }
        toast({ title: "Login successful", description: "Welcome back to RISE Dashboard.", variant: "success" });
        router.push("/dashboard");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setStatus(message);
      toast({ title: "Authentication failed", description: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#fcf8ff] animate-rise-page dark:bg-slate-950">
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <img src="/rise-logo.png" alt="RISE Tutoring" className="mx-auto mb-4 h-20 w-20 rounded-3xl object-cover shadow-lg" />
            <h1 className="bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] bg-clip-text text-3xl font-extrabold text-transparent">
              RISE Tutoring
            </h1>
            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)]" />
          </div>

          <div className="rise-panel rounded-2xl p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-[var(--rise-heading)]">Tutor Portal</h2>
              <p className="mt-2 text-sm text-[var(--rise-text-muted)]">Log sessions, track progress, and keep parents updated.</p>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-2xl bg-[var(--rise-surface-soft)] p-1">
              {(["login", "signup"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    mode === option ? "bg-[var(--rise-surface)] text-[var(--rise-purple)] shadow-sm" : "text-[var(--rise-text-muted)]"
                  }`}
                >
                  {option === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            {!isSupabaseConfigured ? (
              <div className="mb-5 rounded-xl border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] p-4 text-sm leading-6 text-[var(--rise-text-muted)]">
                Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to enable authentication.
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={submitAuth}>
              {mode === "signup" ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[var(--rise-text-muted)]">Full name</span>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="e.g. Elena Dragan"
                    className="rise-input h-12 w-full px-4"
                  />
                </label>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--rise-text-muted)]">Email address</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="name@education.com"
                  className="rise-input h-12 w-full px-4"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="flex items-center justify-between text-sm font-medium text-[var(--rise-text-muted)]">
                  Password
                  <span className="text-xs font-semibold text-[var(--rise-text-soft)]">Minimum 6 characters</span>
                </span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Password"
                  className="rise-input h-12 w-full px-4"
                  required
                />
              </label>
              <BrandButton type="submit" className="w-full" disabled={loading || !isSupabaseConfigured}>
                {loading ? "Working..." : mode === "login" ? "Log in" : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </BrandButton>
            </form>

            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-[var(--rise-border)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--rise-text-soft)]">or</span>
              <span className="h-px flex-1 bg-[var(--rise-border)]" />
            </div>

            <BrandButton variant="secondary" className="w-full opacity-60" disabled>
              Continue with Google - Coming Soon
            </BrandButton>

            {status ? <p className="mt-5 rounded-xl bg-[var(--rise-surface-soft)] p-3 text-center text-sm font-semibold text-[var(--rise-text-muted)]">{status}</p> : null}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--rise-text-soft)]">
            <ShieldCheck className="h-4 w-4" />
            Secure, encrypted connection for educator data privacy.
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
