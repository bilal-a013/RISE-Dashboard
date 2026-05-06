"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Settings2 } from "lucide-react";
import { BrandButton } from "../../../components/rise/BrandButton";
import { Card } from "../../../components/rise/Card";
import { Footer } from "../../../components/rise/Footer";

export default function GoogleAuthPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#fcf8ff] animate-rise-page dark:bg-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-88px)] max-w-2xl items-center px-6 py-16">
        <Card className="w-full space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold text-[#1b1b23]">Google integration</h1>
            <p className="text-sm text-[#464554]">This is a placeholder while Gmail groundwork is prepared.</p>
          </div>

          <div className="rounded-2xl border border-[#c7c4d7] bg-[#f5f2fe] p-5">
            <p className="text-sm leading-6 text-[#464554]">
              The final flow will use Google OAuth for Gmail sending and reply tracking. For now this remains coming soon.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <BrandButton variant="secondary" className="w-full" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </BrandButton>
            <BrandButton className="w-full" onClick={() => router.push("/settings/integrations")}>
              Open Integrations
              <Settings2 className="h-4 w-4" />
            </BrandButton>
          </div>
        </Card>
      </section>
      <Footer />
    </main>
  );
}
