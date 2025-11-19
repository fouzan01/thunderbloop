"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type Status = "loading" | "ok" | "invalid" | "error";

export default function ReferralLandingPage() {
  const params = useParams();
  const code = params?.code as string | undefined;

  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    async function handleReferral() {
      if (!code) return;

      try {
        // 1) find who owns this code
        const codeDocRef = doc(db, "referralCodes", code);
        const codeSnap = await getDoc(codeDocRef);

        if (!codeSnap.exists()) {
          setStatus("invalid");
          return;
        }

        const data = codeSnap.data() as any;
        const ownerUid = data.uid as string;

        // 2) increment their referralCount and points
        const userRef = doc(db, "users", ownerUid);
        await updateDoc(userRef, {
          referralCount: increment(1),
          points: increment(10), // e.g. 10 points per hit – change later
        });

        // 3) log this event
        await addDoc(collection(db, "referralEvents"), {
          code,
          ownerUid,
          createdAt: serverTimestamp(),
        });

        setStatus("ok");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    handleReferral();
  }, [code]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Processing referral...</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-3">
          <p className="text-xl font-semibold">Invalid referral link</p>
          <p className="text-sm text-zinc-400">
            The ThunderBloop referral code in this link is not valid.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-3">
          <p className="text-xl font-semibold">Something went wrong</p>
          <p className="text-sm text-zinc-400">
            Please try again later or contact the ThunderBloop admin.
          </p>
        </div>
      </div>
    );
  }

  // status === "ok"
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-indigo-900 text-white">
      <div className="max-w-md bg-zinc-900/80 border border-zinc-700 rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <h1 className="text-2xl font-semibold">Thanks for supporting!</h1>
        <p className="text-sm text-zinc-300">
          Your visit has been counted for the creator who shared this
          ThunderBloop link.
        </p>
        <p className="text-xs text-zinc-400">
          Next step (manually): follow the instructions they gave you
          – subscribe, watch, or follow on social media.
        </p>
      </div>
    </div>
  );
}
