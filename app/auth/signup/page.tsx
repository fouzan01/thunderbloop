"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [refCode, setRefCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, send to dashboard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        router.push("/dashboard");
      }
    });

    return () => unsub();
  }, [router]);

  // Read ?ref=... from URL WITHOUT useSearchParams
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setRefCode(ref);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // 1) Create auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // 2) Figure out who referred this user (if any)
      let referredBy: string | null = null;

      if (refCode) {
        // In our system the referralCode is the other user's uid.
        const refDocRef = doc(db, "users", refCode);
        const refSnap = await getDoc(refDocRef);

        if (refSnap.exists()) {
          referredBy = refCode;

          // Give the referrer extra points + increment their referral count
          await updateDoc(refDocRef, {
            referralCount: increment(1),
            points: increment(45), // same as you used when testing
          });
        }
      }

      // 3) Create Firestore profile for this new user
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        points: 0,
        referralCount: 0,
        referralCode: user.uid, // we use uid as referral code
        referredBy: referredBy,
        createdAt: new Date().toISOString(),
      });

      // 4) Go to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrorMsg(err?.message ?? "Failed to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-indigo-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold mb-1">Sign Up</h1>
        <p className="text-xs text-zinc-400 mb-4">
          Create your ThunderBloop account.
          {refCode && (
            <span className="ml-1 text-emerald-400">
              You are joining with a referral.
            </span>
          )}
        </p>

        {errorMsg && (
          <p className="text-xs text-red-400 mb-3 break-words">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 rounded-md bg-black/40 border border-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-md bg-black/40 border border-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </div>

          {refCode && (
            <p className="text-[11px] text-zinc-500">
              Referral code detected:{" "}
              <span className="text-indigo-300 break-all">{refCode}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-zinc-500">
          Already have an account?{" "}
          <a href="/auth/login" className="text-indigo-300 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
