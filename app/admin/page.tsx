"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

type AdminUserRow = {
  id: string;
  email: string;
  points: number;
  referralCount: number;
  referredBy?: string | null;
};

// Admin email(s)
const ADMIN_EMAILS = ["fouzan1605@gmail.com"];

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Check auth + admin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setIsAdmin(false);
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      setCurrentUser(user);
      const admin = ADMIN_EMAILS.includes(user.email || "");
      setIsAdmin(admin);

      if (!admin) {
        setLoading(false);
        return;
      }

      await loadUsers();
    });

    return () => unsub();
  }, [router]);

  async function loadUsers() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "users"));
      const list: AdminUserRow[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        list.push({
          id: docSnap.id,
          email: data.email ?? "unknown",
          points: data.points ?? 0,
          referralCount: data.referralCount ?? 0,
          referredBy: data.referredBy ?? null,
        });
      });

      list.sort((a, b) => b.points - a.points);
      setUsers(list);
    } catch (err) {
      console.error("Error loading users:", err);
      setActionMsg("Failed to load users. Check console.");
    } finally {
      setLoading(false);
    }
  }

  async function adjustPoints(userId: string, delta: number) {
    try {
      setActionMsg(null);
      await updateDoc(doc(db, "users", userId), {
        points: increment(delta),
      });
      setActionMsg(
        `Updated points by ${delta > 0 ? "+" : ""}${delta} for ${userId}`
      );
      await loadUsers();
    } catch (err) {
      console.error("Error adjusting points:", err);
      setActionMsg("Failed to adjust points. Check console.");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Loading admin panel...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-zinc-400">You are not logged in.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p className="text-red-400 mb-2 text-lg font-semibold">
          Access denied
        </p>
        <p className="text-zinc-400 text-sm mb-4">
          This page is only for ThunderBloop admins.
        </p>
        <a
          href="/dashboard"
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm"
        >
          Go to dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-indigo-900 text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-black/40 backdrop-blur">
        <div>
          <h1 className="text-xl font-semibold">ThunderBloop – Admin</h1>
          <p className="text-xs text-zinc-400">Logged in as {currentUser.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/tasks"
            className="text-sm px-3 py-1 rounded-md border border-amber-500 text-amber-200 hover:bg-amber-600/20 transition"
          >
            Task submissions
          </a>
          <a
            href="/dashboard"
            className="text-sm px-3 py-1 rounded-md border border-indigo-500 text-indigo-200 hover:bg-indigo-600/20 transition"
          >
            User dashboard
          </a>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md border border-zinc-600 text-sm hover:bg-zinc-800 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Users overview</h2>
          <button
            onClick={loadUsers}
            className="px-3 py-1 text-sm rounded-md border border-zinc-600 hover:bg-zinc-800 transition"
          >
            Refresh
          </button>
        </div>

        {actionMsg && (
          <p className="text-xs text-emerald-400 mb-2">{actionMsg}</p>
        )}

        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 shadow-xl overflow-x-auto">
          {users.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No users found yet. Ask people to sign up.
            </p>
          ) : (
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left py-2 pr-4">Email</th>
                  <th className="text-left py-2 pr-4">User ID</th>
                  <th className="text-right py-2 pr-4">Points</th>
                  <th className="text-right py-2 pr-4">Referrals</th>
                  <th className="text-right py-2 pr-4">Referred By</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-800/70 hover:bg-zinc-800/40"
                  >
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4 break-all max-w-xs">{u.id}</td>
                    <td className="py-2 pr-4 text-right">{u.points}</td>
                    <td className="py-2 pr-4 text-right">
                      {u.referralCount}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {u.referredBy || "-"}
                    </td>
                    <td className="py-2 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => adjustPoints(u.id, 10)}
                          className="px-2 py-1 rounded-md border border-emerald-500 text-xs hover:bg-emerald-600/30"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => adjustPoints(u.id, -10)}
                          className="px-2 py-1 rounded-md border border-red-500 text-xs hover:bg-red-600/30"
                        >
                          -10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
