"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
        router.replace("/");
        return;
      }
      const data: any = shareSnap.data();
      const videoId = data.videoId;
      // optional: set last clicked timestamp
      await setDoc(doc(db, "shareClicks", shareId), { lastClickedAt: serverTimestamp() }, { merge: true }).catch(()=>{});
      window.location.href = `/video/${videoId}?share=${shareId}`;
    })();
  }, [shareId, router]);

  return <div style={{ padding: 40 }}>Redirecting…</div>;
}
