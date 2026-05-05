import { Suspense } from "react";
import NewStudentPageClient from "./student-page-client";

export default function NewStudentPage() {
  return (
    <Suspense fallback={null}>
      <NewStudentPageClient />
    </Suspense>
  );
}
