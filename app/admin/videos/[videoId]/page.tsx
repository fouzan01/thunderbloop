declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}
// app/video/[videoId]/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseClient";

declare global {
  interface Window { YT: any; }
}

export default function VideoPage({ params }: { params: { videoId: string } }) {
  const { videoId } = params;
  const search = useSearchParams();
  const share = search?.get("share") ?? null;
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const sessionIdRef = useRef<string>("");
  const lastSentRef = useRef<number>(0);
  const totalWatchedRef = useRef<number>(0);

  // create a session id stored in localStorage to group events
  useEffect(() => {
    let sid = localStorage.getItem("viewerSessionId");
    if (!sid) { sid = Math.random().toString(36).slice(2, 12); localStorage.setItem("viewerSessionId", sid); }
    sessionIdRef.current = sid;
  }, []);

  // load YouTube IFrame api if needed
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).YT) { initPlayer(); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    window.onYouTubeIframeAPIReady = () => initPlayer();
    document.body.appendChild(tag);
  }, [videoId]);

  function initPlayer() {
    if (!playerContainerRef.current) return;
    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      height: "480",
      width: "854",
      videoId,
      events: {
        onReady: () => setPlayerReady(true),
        onStateChange: onPlayerStateChange,
      }
    });
  }

  function onPlayerStateChange(event: any) {
    const state = event.data; // -1, 0=ended, 1=playing, 2=paused
    // when playing start heartbeat every 10s
    if (state === 1) {
      startHeartBeat();
    } else {
      stopHeartBeat();
      if (state === 0) {
        // ended, send final event
        sendWatchEvent("ended");
      } else if (state === 2) {
        sendWatchEvent("pause");
      }
    }
  }

  let hbTimer: any = null;
  function startHeartBeat() {
    if (hbTimer) return;
    sendWatchEvent("play");
    hbTimer = setInterval(() => {
      sendWatchEvent("heartbeat");
    }, 10000); // every 10 seconds
  }
  function stopHeartBeat() {
    if (hbTimer) { clearInterval(hbTimer); hbTimer = null; }
  }

  // sends watch event to Firestore
  async function sendWatchEvent(evt: string) {
    try {
      const pos = playerRef.current?.getCurrentTime?.() || 0;
      const now = Date.now();
      // compute delta roughly
      let delta = 0;
      if (lastSentRef.current) {
        delta = Math.round((now - lastSentRef.current) / 1000);
      } else {
        delta = 0;
      }
      lastSentRef.current = now;
      if (evt === "heartbeat" && delta <= 0) return;
      totalWatchedRef.current += delta;

      const payload = {
        videoId,
        share: share ?? null,
        sessionId: sessionIdRef.current,
        position: pos,
        event: evt,
        secondsDelta: delta,
        uid: auth.currentUser?.uid ?? null,
        ts: serverTimestamp(),
      };
      // write event
      await addDoc(collection(db, "watchEvents"), payload);
    } catch (e) {
      // ignore errors in MVP
      console.warn("track error", e);
    }
  }

  useEffect(() => {
    return () => {
      stopHeartBeat();
      // send final
      sendWatchEvent("unload");
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Video {videoId}</h1>
      <div ref={playerContainerRef}></div>

      <div style={{ marginTop: 12 }}>
        {share && <div>Referred by share: <strong>{share}</strong></div>}
        <small>Session id: {sessionIdRef.current}</small>
      </div>
    </div>
  );
}
