"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
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
      const code = err?.code ?? "";
      if (code === "auth/invalid-email") setError("Invalid email address.");
      else if (code === "auth/user-not-found")
        setError("No account found with that email.");
      else if (code === "auth/too-many-requests")
        setError("Too many requests. Try again later.");
      else setError(err?.message ?? "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

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
