// app/auth/reset/page.tsx
import React from "react";
import ResetForm from "./ResetForm";

export const metadata = {
  title: "Reset password"
};

export default function ResetPage() {
  // This can remain a server component — it's fine to import a client component.
  return (
    <main>
      <ResetForm />
    </main>
  );
}
