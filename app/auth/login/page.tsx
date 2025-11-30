"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebaseClient";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // signed in
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 16 }}>Login</h1>

      <form onSubmit={loginWithEmail} style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", margin: "12px 0" }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: 10, width: "100%", marginTop: 8 }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <button
          onClick={loginWithGoogle}
          disabled={loading}
          style={{
            padding: 10,
            width: "100%",
            background: "#DB4437",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {loading ? "Please wait..." : "Continue with Google"}
        </button>
      </div>

      {error && (
        <div style={{ color: "crimson", marginTop: 8 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
        <a href="/auth/forgot">Forgot password?</a>
        <a href="/auth/signup">Create account</a>
      </div>
    </div>
  );
}
