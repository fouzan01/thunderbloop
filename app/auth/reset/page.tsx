import React, { Suspense } from "react";
import ResetForm from "./ResetForm";

export default function ResetPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}

