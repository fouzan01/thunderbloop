// app/auth/reset/ResetForm.tsx
"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

type FormState = {
  password: string;
  confirmPassword: string;
};

export default function ResetForm(): JSX.Element {
  const searchParams = useSearchParams();
  const oobCode = searchParams?.get("oobCode") ?? ""; // example param name used by firebase reset links

  const [form, setForm] = useState<FormState>({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!oobCode) {
      setError("Missing reset code.");
      return;
    }

    try {
      setLoading(true);
      // TODO: call your firebase reset password / confirmPasswordReset logic here
      // Example (if using firebase client):
      // await confirmPasswordReset(auth, oobCode, form.password);

      // For now, mock:
      await new Promise(res => setTimeout(res, 700));
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-form-container">
      <h2>Reset your password</h2>

      {error && <div className="error">{error}</div>}
      {success ? (
        <div className="success">Password reset successfully. You can now log in.</div>
      ) : (
        <form onSubmit={onSubmit}>
          <input
            name="password"
            type="password"
            placeholder="New password"
            value={form.password}
            onChange={onChange}
            minLength={6}
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={onChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}
    </div>
  );
}
