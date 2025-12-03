// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Leaderboard from "@/components/Leaderboard";
import ReferralCard from "@/components/ReferralCard";

type UserInfo = {
  email?: string | null;
  displayName?: string | null;
};

export default function DashboardPage(): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) {
        router.push("/auth/login");
        return;
      }
      setUser({ email: u.email, displayName: u.displayName || u.email?.split("@")[0] });
      // Demo: points read from localStorage or default
      const stored = Number(localStorage.getItem("tb_points")) || 1240;
      setPoints(stored);
    });
    return () => unsub();
  }, [router]);

  async function doSignOut() {
    await signOut(auth);
    router.push("/auth/login");
  }

  // Demo actions
  function addPoints(n = 50) {
    const newPts = points + n;
    setPoints(newPts);
    localStorage.setItem("tb_points", String(newPts));
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm text-slate-400">Welcome, {user?.email}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white/6 rounded text-sm">
              <div className="text-xs text-slate-300">Points</div>
              <div className="font-semibold text-lg">{points}</div>
            </div>

            <button onClick={addPoints} className="px-3 py-2 bg-amber-400 rounded font-medium">+ Earn</button>

            <button onClick={doSignOut} className="px-3 py-2 border border-white/10 rounded text-sm">Sign out</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Your highlights</h3>
              {/* Placeholder content for now — replace with real widgets later */}
              <div className="rounded-lg p-4 bg-white/6">Recent activity and metrics go here (views, retention, CTR)</div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Leaderboard</h3>
              <Leaderboard />
            </section>
          </div>

          <aside>
            <ReferralCard points={points} />
            <div className="mt-6 p-4 rounded-lg bg-white/6">
              <h4 className="font-semibold mb-2">Quick actions</h4>
              <button className="w-full mb-2 px-3 py-2 rounded bg-indigo-600 text-white">Promote clip</button>
              <button className="w-full px-3 py-2 rounded border">Save draft</button>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
