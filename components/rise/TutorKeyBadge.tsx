"use client";

import { ClipboardCopy } from "lucide-react";

export function TutorKeyBadge({ tutorKey, onCopy }: { tutorKey: string; onCopy?: () => void }) {
  async function copy() {
    await navigator.clipboard.writeText(tutorKey);
    onCopy?.();
  }

  return (
    <div className="rounded-2xl bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] p-5 text-white shadow-lg shadow-[#4648d4]/20">
      <p className="text-xs font-bold uppercase tracking-wide text-white/75">Tutor Key</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="font-mono text-2xl font-black tracking-widest">{tutorKey}</p>
        <button type="button" onClick={copy} className="rounded-xl bg-white/15 p-2 hover:bg-white/25" aria-label="Copy tutor key">
          <ClipboardCopy className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/85">Use this key to quickly load this child's profile before each session.</p>
    </div>
  );
}
