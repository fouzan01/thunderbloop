// components/ResetForm.tsx
"use client";

import React, { useState } from "react";
import { sendPasswordReset } from "../lib/authHelpers";

export default function ResetForm(): JSX.Element {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "idle" | "sending" | "sent" | "error">(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);
    try {
      await sendPasswordReset(email);
      setStatus("sent");
    } catch (err: any) {
      console.error("Reset error:", err);
      setErrorMessage(err?.message || "Could not send password reset email");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Reset your password</h2>

      {status === "sent" ? (
        <div className="p-4 bg-green-50 text-green-900 border rounded">
          If an account exists for <strong>{email}</strong>, a password reset email has been sent.
          Check your inbox and spam folder.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border p-2"
              placeholder="you@example.com"
            />
          </div>

          {status === "error" && errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded bg-blue-600 text-white disabled:opacity-60"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Send reset email"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-4 text-sm text-gray-600">
        Didn't receive it? Make sure you entered the correct email, or check your spam folder.
      </p>
    </div>
  );
}
