import ResetForm from "./ResetForm";

export const metadata = {
  title: "Reset password",
};

export default function ResetPage() {
  // server component: does NOT use any client-only hooks
  return (
    <main style={{ maxWidth: 760, margin: "48px auto", padding: 20 }}>
      <ResetForm />
    </main>
  );
}
