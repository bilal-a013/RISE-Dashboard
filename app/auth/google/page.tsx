"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Card } from "../../../components/rise/Card";
import { Footer } from "../../../components/rise/Footer";

export default function GoogleAuthPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#fcf8ff]">
      <section className="mx-auto flex min-h-[calc(100vh-88px)] max-w-2xl items-center px-6 py-16">
        <Card className="w-full space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold text-[#1b1b23]">Continue with Google</h1>
            <p className="text-sm text-[#464554]">This is a mock OAuth step for the RISE prototype.</p>
          </div>

          <div className="rounded-2xl border border-[#c7c4d7] bg-[#f5f2fe] p-5">
            <p className="text-sm leading-6 text-[#464554]">
              In the live product, this step will hand off to Google sign-in and then return the tutor to the dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <BrandButton variant="secondary" className="w-full" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </BrandButton>
            <BrandButton className="w-full" onClick={() => router.push("/dashboard")}>
              Continue to RISE
              <ArrowRight className="h-4 w-4" />
            </BrandButton>
          </div>
        </Card>
      </section>
      <Footer />
    </main>
  );
}
