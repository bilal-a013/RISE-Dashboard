import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "RISE Tutoring | Post-Session Tutor Log",
  description: "Generate polished parent reports and structured session payloads for RISE Tutoring.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
