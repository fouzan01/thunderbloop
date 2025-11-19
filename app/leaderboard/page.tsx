"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type LeaderUser = {
  id: string;
  email: string;
  points: number;
  referralCount: number;
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("points", "desc"),
          limit(50)
        );
        const snap = await getDocs(q);

        const list: LeaderUser[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            email: data.email ?? "unknown",
            points: data.points ?? 0,
            referralCount: data.referralCount ?? 0,
          });
        });

        setUsers(list);
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-indigo-900 text-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-black/40 backdrop-blur">
        <h1 className="text-xl font-semibold">
          ThunderBloop Leaderboard
        </h1>
        <a
          href="/dashboard"
          className="text-sm text-indigo-300 hover:text-indigo-100 underline"
        >
          Back to dashboard
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">
            Top Users by Points
          </h2>

          {users.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No users yet. Start inviting people to appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="text-left py-2">Rank</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-right py-2">Points</th>
                    <th className="text-right py-2">Referrals</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => (
                    <tr
                      key={u.id}
                      className="border-b border-zinc-800/60 hover:bg-zinc-800/40"
                    >
                      <td className="py-2 pr-4">{index + 1}</td>
                      <td className="py-2 pr-4">
                        {u.email}
                      </td>
                      <td className="py-2 text-right">
                        {u.points}
                      </td>
                      <td className="py-2 text-right">
                        {u.referralCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
