"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

type FormState = { password: string; confirmPassword: string };

export default function ResetForm(): React.ReactElement {
  const searchParams = useSearchParams();
  const oobCode = searchParams?.get("oobCode") ?? "";

  const [form, setForm] = useState<FormState>({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (!oobCode) { setError("Missing reset code."); return; }

    try {
      setLoading(true);
      // TODO: replace with actual firebase confirmPasswordReset(auth, oobCode, form.password)
      await new Promise(res => setTimeout(res, 700));
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Reset your password</h2>
      {error && <div style={{ color: "#b00020", marginBottom: 12 }}>{error}</div>}
      {success ? (
        <div style={{ color: "#007700" }}>Password reset successfully. You can now log in.</div>
      ) : (
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", marginBottom: 6 }}>New password</label>
            <input name="password" type="password" placeholder="New password" value={form.password} onChange={onChange} minLength={6} required style={{ width: "100%", padding: 8, boxSizing: "border-box" }}/>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Confirm password</label>
            <input name="confirmPassword" type="password" placeholder="Confirm new password" value={form.confirmPassword} onChange={onChange} required style={{ width: "100%", padding: 8, boxSizing: "border-box" }}/>
          </div>
          <button type="submit" disabled={loading} style={{ padding: "10px 16px", cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Resetting..." : "Reset password"}</button>
        </form>
      )}
    </div>
  );
}