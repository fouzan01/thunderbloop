import React, { Suspense } from "react";
import ResetForm from "./ResetForm";

/**
 * Server page for /auth/reset. It renders a client ResetForm wrapped in Suspense.
 * That prevents `useSearchParams()` or other client-only hooks from breaking prerender.
 */
export default function ResetPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Reset password</h1>

      <Suspense fallback={<div>Loading reset form…</div>}>
        {/* ResetForm is a client component (has "use client") */}
        <ResetForm />
      </Suspense>
    </main>
  );
}
