// app/auth/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseClient";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Login</h1>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              type="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              type="password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <hr className="flex-1 border-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <hr className="flex-1 border-slate-200" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={busy}
          className="mt-4 w-full bg-red-500 text-white py-3 rounded font-semibold hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-3"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FBBC05" d="M43.6 20.5H42V20H24v8h11.3C34.7 32 30 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l5.6-5.6C34.9 6.9 29.8 5 24 5 12.8 5 4 13.8 4 25s8.8 20 20 20 20-8.8 20-20c0-1.3-.1-2.5-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <div className="mt-4 flex justify-between text-sm">
          <a className="text-indigo-600 hover:underline" href="/auth/reset">Forgot password?</a>
          <a className="text-indigo-600 hover:underline" href="/auth/signup">Create account</a>
        </div>
      </div>
    </div>
  );
}
