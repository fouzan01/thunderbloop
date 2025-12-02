"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setStatus("Password reset email sent successfully. Check Inbox/Spam.");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 20 }}>
      <h1>Reset Password</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 20 }}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: 10,
              marginTop: 10,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>

      {status && (
        <p style={{ marginTop: 20, color: "green" }}>{status}</p>
      )}
      {error && (
        <p style={{ marginTop: 20, color: "crimson" }}>{error}</p>
      )}
    </div>
  );
}
