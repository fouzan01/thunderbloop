// app/r/[shareId]/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function ShareRedirectPage({ params }: { params: { shareId: string } }) {
  const router = useRouter();
  const shareId = params.shareId;

  useEffect(() => {
    (async () => {
      if (!shareId) return;
      const shareDocRef = doc(db, "shares", shareId);
      const shareSnap = await getDoc(shareDocRef);
      if (!shareSnap.exists()) {
        // not found — redirect home
        router.replace("/");
        return;
      }
      const data: any = shareSnap.data();
      const videoId = data.videoId;
      // optionally increment a click counter (simple)
      const clickRef = doc(db, "shareClicks", `${shareId}_last`);
      await setDoc(clickRef, { lastClickedAt: serverTimestamp(), shareId }, { merge: true }).catch(()=>{});
      // redirect to video page with share id
      window.location.href = `/video/${videoId}?share=${shareId}`;
    })();
  }, [shareId]);

  return <div style={{ padding: 40 }}>Redirecting…</div>;
}
