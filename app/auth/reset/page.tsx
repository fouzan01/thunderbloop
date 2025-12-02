import React, { Suspense } from "react";
import ResetForm from "./ResetForm";

/**
 * Server page for /auth/reset.
 * This page stays a server component and simply renders the client ResetForm.
 */
export default function ResetPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Reset password</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
