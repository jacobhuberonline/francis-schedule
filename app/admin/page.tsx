import type { Metadata } from "next";
import { Suspense } from "react";

import AdminClient from "./admin-client";

export const metadata: Metadata = {
  title: "Francis Schedule Admin",
  description:
    "Configure Francis's feed, nap, and play timings, then generate a shareable caregiver link.",
};

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminClient />
    </Suspense>
  );
}

function AdminFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 text-sm text-muted-foreground">
      Loading Francis&apos;s admin tools…
    </main>
  );
}
