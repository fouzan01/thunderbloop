"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth"; // adjust import if you use a wrapper
import { auth } from "@/lib/firebaseClient"; // adjust path if needed

export default function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? ""; // example: if you expect token
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!email || email.trim().length < 5) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus("Password reset email sent. Check your inbox/spam.");
      setEmail("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "48px auto", padding: 20 }}>
      <h1>Reset your password</h1>
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 8 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Sending..." : "Send reset email"}
        </button>
      </form>

      {status && <div style={{ color: "green", marginTop: 12 }}>{status}</div>}
      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}
    </div>
  );
}
