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

type Submission = {
  id: string;
  userId: string;
  userEmail: string;
  taskId: string;
  taskTitle: string;
  points: number;
  proof: string;
  status: string;
  createdAt?: string;
};

const ADMIN_EMAILS = ["fouzan1605@gmail.com"];

export default function AdminTasksPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

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

      await loadSubmissions();
    });

    return () => unsub();
  }, [router]);

  async function loadSubmissions() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "taskSubmissions"));
      const list: Submission[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        list.push({
          id: docSnap.id,
          userId: data.userId ?? "",
          userEmail: data.userEmail ?? "",
          taskId: data.taskId ?? "",
          taskTitle: data.taskTitle ?? "",
          points: data.points ?? 0,
          proof: data.proof ?? "",
          status: data.status ?? "pending",
          createdAt: data.createdAt ?? "",
        });
      });

      // Sort: pending first, then by createdAt desc
      list.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      });

      setSubmissions(list);
    } catch (err) {
      console.error("Error loading submissions:", err);
      setActionMsg("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(sub: Submission, newStatus: "approved" | "rejected") {
    try {
      setActionMsg(null);

      // 1) Update submission status
      await updateDoc(doc(db, "taskSubmissions", sub.id), {
        status: newStatus,
        reviewedAt: new Date().toISOString(),
      });

      // 2) If approved, give user points
      if (newStatus === "approved" && sub.userId && sub.points > 0) {
        await updateDoc(doc(db, "users", sub.userId), {
          points: increment(sub.points),
        });
      }

      setActionMsg(
        `Marked submission ${sub.id} as ${newStatus}.`
      );
      await loadSubmissions();
    } catch (err) {
      console.error("Error updating submission:", err);
      setActionMsg("Failed to update submission.");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Loading task submissions...</p>
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
          <h1 className="text-xl font-semibold">ThunderBloop – Task Submissions</h1>
          <p className="text-xs text-zinc-400">
            Logged in as {currentUser.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="text-sm px-3 py-1 rounded-md border border-indigo-500 text-indigo-200 hover:bg-indigo-600/20 transition"
          >
            Users admin
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
          <h2 className="text-lg font-semibold">Submissions</h2>
          <button
            onClick={loadSubmissions}
            className="px-3 py-1 text-sm rounded-md border border-zinc-600 hover:bg-zinc-800 transition"
          >
            Refresh
          </button>
        </div>

        {actionMsg && (
          <p className="text-xs text-emerald-400 mb-2">{actionMsg}</p>
        )}

        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 shadow-xl overflow-x-auto">
          {submissions.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No submissions yet.
            </p>
          ) : (
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Task</th>
                  <th className="text-left py-2 pr-4">User</th>
                  <th className="text-left py-2 pr-4">Proof</th>
                  <th className="text-right py-2 pr-4">Points</th>
                  <th className="text-right py-2 pr-4">Created</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-zinc-800/70 align-top hover:bg-zinc-800/40"
                  >
                    <td className="py-2 pr-4">
                      <span
                        className={
                          s.status === "pending"
                            ? "text-amber-300"
                            : s.status === "approved"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="font-semibold">{s.taskTitle}</div>
                      <div className="text-[10px] text-zinc-500">
                        Task ID: {s.taskId}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <div>{s.userEmail}</div>
                      <div className="text-[10px] text-zinc-500 break-all max-w-xs">
                        {s.userId}
                      </div>
                    </td>
                    <td className="py-2 pr-4 max-w-xs break-words">
                      {s.proof}
                    </td>
                    <td className="py-2 pr-4 text-right">{s.points}</td>
                    <td className="py-2 pr-4 text-right text-[10px] text-zinc-500">
                      {s.createdAt}
                    </td>
                    <td className="py-2 text-right">
                      {s.status === "pending" ? (
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => updateStatus(s, "approved")}
                            className="px-2 py-1 rounded-md border border-emerald-500 text-xs hover:bg-emerald-600/30"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(s, "rejected")}
                            className="px-2 py-1 rounded-md border border-red-500 text-xs hover:bg-red-600/30"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-500">
                          already {s.status}
                        </span>
                      )}
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
