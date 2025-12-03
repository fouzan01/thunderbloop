import React, { Suspense } from "react";
import ResetForm from "./ResetForm";

export const metadata = { title: "Reset password" };

export default function ResetPage() {
  return (
    <main style={{ padding: 24 }}>
      <Suspense fallback={<div>Loading form…</div>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}