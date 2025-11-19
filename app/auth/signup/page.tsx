
"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import {
  doc,
  setDoc,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referrerId, setReferrerId] = useState<string | null>(null);

  // Read ?ref= from URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferrerId(ref);
    }
  }, [searchParams]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1) Create auth user
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCred.user.uid;

      // 2) Create user document
      await setDoc(doc(db, "users", uid), {
        email,
        createdAt: new Date(),
        points: 0,
        referralCount: 0,
        referralCode: uid,       // we use uid as referral code
        referredBy: referrerId || null,
      });

      // 3) If someone referred this user, update their stats
      if (referrerId) {
        const refDocRef = doc(db, "users", referrerId);
        const refDocSnap = await getDoc(refDocRef);

        if (refDocSnap.exists()) {
          await updateDoc(refDocRef, {
            referralCount: increment(1),
            points: increment(10), // 👈 each referral = +10 points
          });
        }
      }

      // 4) Go to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          ThunderBloop – Sign Up
        </h1>

        {referrerId && (
          <p className="mb-4 text-xs text-emerald-400 text-center">
            You are joining via a referral. Referrer ID: {referrerId}
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md px-3 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md px-3 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <p className="mt-4 text-sm text-zinc-400 text-center">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
