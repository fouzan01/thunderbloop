"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

type UserProfile = {
  email: string | null;
  points: number;
  referralCount: number;
  referralCode: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  points: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [proofTexts, setProofTexts] = useState<Record<string, string>>({});
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [submissionMsg, setSubmissionMsg] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Load user profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setLoadingUser(false);
        router.push("/auth/login");
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as any;
          setUserProfile({
            email: user.email,
            points: data.points ?? 0,
            referralCount: data.referralCount ?? 0,
            referralCode: data.referralCode ?? user.uid,
          });
        } else {
          setUserProfile({
            email: user.email,
            points: 0,
            referralCount: 0,
            referralCode: user.uid,
          });
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        setErrorMsg("Failed to load your data.");
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsub();
  }, [router]);

  // Load tasks (filter & sort in JS)
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoadingTasks(true);
        const snap = await getDocs(collection(db, "tasks"));
        const list: Task[] = [];

        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (data.isActive === true) {
            list.push({
              id: docSnap.id,
              title: data.title ?? "",
              description: data.description ?? "",
              points: data.points ?? 0,
            });
          }
        });

        list.sort((a, b) => b.points - a.points);
        setTasks(list);
      } catch (err) {
        console.error("Error loading tasks:", err);
      } finally {
        setLoadingTasks(false);
      }
    }

    loadTasks();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    router.push("/auth/login");
  }

  async function handleSubmitProof(task: Task) {
    setSubmissionMsg(null);
    setSubmissionError(null);

    if (!userProfile) {
      setSubmissionError("You must be logged in.");
      return;
    }

    const proof = (proofTexts[task.id] || "").trim();
    if (!proof) {
      setSubmissionError("Please enter some proof text or link.");
      return;
    }

    try {
      setSubmittingTaskId(task.id);

      await addDoc(collection(db, "taskSubmissions"), {
        userId: auth.currentUser?.uid || "",
        userEmail: userProfile.email || "",
        taskId: task.id,
        taskTitle: task.title,
        points: task.points,
        proof,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setSubmissionMsg(
        `Submitted "${task.title}" for review. Admin will approve if valid.`
      );

      setProofTexts((prev) => ({
        ...prev,
        [task.id]: "",
      }));
    } catch (err) {
      console.error("Error submitting proof:", err);
      setSubmissionError("Failed to submit. Try again.");
    } finally {
      setSubmittingTaskId(null);
    }
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!userProfile || errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <p className="text-red-400 mb-3">
          {errorMsg ?? "Could not load your account."}
        </p>
        <button
          onClick={() => router.refresh()}
          className="px-4 py-2 bg-indigo-600 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  const BASE_URL = "http://localhost:3000";
  const referralLink = `${BASE_URL}/auth/signup?ref=${userProfile.referralCode}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-indigo-900 text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-black/40 backdrop-blur">
        <h1 className="text-xl font-semibold">
          ThunderBloop
          <span className="text-sm text-zinc-500 ml-2">beta</span>
        </h1>

        <div className="flex items-center gap-4">
          <a
            href="/leaderboard"
            className="text-sm px-3 py-1 rounded-md border border-indigo-500 hover:bg-indigo-600/20"
          >
            Leaderboard
          </a>
          <a
            href="/admin"
            className="text-sm px-3 py-1 rounded-md border border-amber-500 hover:bg-amber-600/20"
          >
            Admin
          </a>
          <span className="text-sm text-zinc-300">{userProfile.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md border border-zinc-600 hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* USER STATS */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5">
            <p className="text-sm text-zinc-400">Total Points</p>
            <p className="mt-2 text-3xl font-bold">{userProfile.points}</p>
          </div>

          <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5">
            <p className="text-sm text-zinc-400">Referral Count</p>
            <p className="mt-2 text-3xl font-bold">
              {userProfile.referralCount}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5">
            <p className="text-sm text-zinc-400">Account Status</p>
            <p className="mt-2 text-lg text-emerald-400 font-semibold">
              Active
            </p>
          </div>
        </section>

        {/* REFERRAL LINK */}
        <section className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-2">Your referral link</h2>
          <p className="text-sm bg-black/40 px-3 py-2 rounded border border-zinc-800 break-all">
            {referralLink}
          </p>
        </section>

        {/* MESSAGES */}
        {(submissionMsg || submissionError) && (
          <section>
            {submissionMsg && (
              <p className="text-xs text-emerald-400 mb-1">{submissionMsg}</p>
            )}
            {submissionError && (
              <p className="text-xs text-red-400 mb-1">{submissionError}</p>
            )}
          </section>
        )}

        {/* TASKS SECTION */}
        <section className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Available Tasks</h2>

          {loadingTasks ? (
            <p className="text-zinc-400 text-sm">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-zinc-400 text-sm">No active tasks right now.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-zinc-800 rounded-xl p-4 bg-black/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{task.title}</h3>
                    <span className="text-xs px-2 py-1 border border-emerald-500 rounded-full text-emerald-400">
                      {task.points} pts
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {task.description}
                  </p>

                  <div className="mt-2 space-y-1">
                    <label className="text-[11px] text-zinc-400">
                      Proof (describe what you did or paste a link/screenshot URL)
                    </label>
                    <input
                      type="text"
                      className="w-full text-xs px-2 py-1 rounded-md bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={proofTexts[task.id] ?? ""}
                      onChange={(e) =>
                        setProofTexts((prev) => ({
                          ...prev,
                          [task.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => handleSubmitProof(task)}
                      disabled={submittingTaskId === task.id}
                      className="mt-1 text-xs px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submittingTaskId === task.id
                        ? "Submitting..."
                        : "Submit for review"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
