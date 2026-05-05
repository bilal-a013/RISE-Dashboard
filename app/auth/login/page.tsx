"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Footer } from "../../../components/rise/Footer";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col bg-[#fcf8ff]">
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] bg-clip-text text-3xl font-extrabold text-transparent">
              RISE Tutoring
            </h1>
            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)]" />
          </div>

          <div className="rounded-2xl border border-[#c7c4d7] bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-[#1b1b23]">Tutor Portal</h2>
              <p className="mt-2 text-sm text-[#464554]">Log sessions, track progress, and keep parents updated.</p>
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                router.push("/dashboard");
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#464554]">Email Address</span>
                <input
                  type="email"
                  placeholder="name@education.com"
                  className="h-12 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 text-[#1b1b23] outline-none transition placeholder:text-[#767586] focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white"
                />
              </label>
              <label className="block space-y-2">
                <span className="flex items-center justify-between text-sm font-medium text-[#464554]">
                  Password
                  <a href="#" className="text-xs font-semibold text-[#4648d4] underline underline-offset-4">
                    Forgot password?
                  </a>
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  className="h-12 w-full rounded-xl border border-[#c7c4d7] bg-white px-4 text-[#1b1b23] outline-none transition placeholder:text-[#767586] focus:border-[#4648d4] focus:bg-[#fcf8ff] focus:ring-4 focus:ring-[#e1e0ff] focus:ring-offset-2 focus:ring-offset-white"
                />
              </label>
              <BrandButton type="submit" className="w-full">
                Log in
                <ArrowRight className="h-4 w-4" />
              </BrandButton>
            </form>

            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#c7c4d7]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#767586]">or</span>
              <span className="h-px flex-1 bg-[#c7c4d7]" />
            </div>

            <BrandButton
              variant="secondary"
              className="w-full"
              onClick={() => {
                // TODO: Wire real Google OAuth sign-in.
                router.push("/auth/google");
              }}
            >
              Continue with Google
            </BrandButton>

            <p className="mt-7 text-center text-sm text-[#464554]">
              New to RISE?{" "}
              <button
                type="button"
                onClick={() => {
                  // TODO: Route to a dedicated signup flow.
                  router.push("/students/new");
                }}
                className="font-semibold text-[#4648d4] underline underline-offset-4"
              >
                Create tutor account
              </button>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#767586]">
            <ShieldCheck className="h-4 w-4" />
            Secure, encrypted connection for educator data privacy.
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
