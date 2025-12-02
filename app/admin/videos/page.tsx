"use client";

import React, { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseClient";
import { nanoid } from "nanoid";

export default function AdminVideosPage() {
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  function extractVideoId(url: string) {
    const m = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/) || url.match(/youtube\.com\/embed\/([^?&]+)/);
    return m ? m[1] : null;
  }

  const addVideo = async () => {
    const vid = extractVideoId(youtubeUrl);
    if (!vid) { alert("Invalid YouTube URL"); return; }
    if (!title) { alert("Add a title"); return; }
    await addDoc(collection(db, "videos"), {
      videoId: vid,
      title,
      createdAt: serverTimestamp(),
      createdByUid: auth.currentUser?.uid ?? null
    });
    setTitle(""); setYoutubeUrl("");
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const createShare = async (videoId: string) => {
    if (!auth.currentUser) {
      alert("Sign in to create share links.");
      return;
    }
    const shareId = nanoid(8);
    await addDoc(collection(db, "shares"), {
      shareId,
      videoId,
      referrerUid: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    alert(`Share link created: ${window.location.origin}/r/${shareId}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin — Videos</h1>

      <div style={{ marginTop: 16 }}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input placeholder="YouTube URL" value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)} style={{ marginLeft: 8, width: 480 }} />
        <button onClick={addVideo} style={{ marginLeft: 8 }}>Add video</button>
      </div>

      <h2 style={{ marginTop: 24 }}>Videos</h2>
      <div style={{ marginTop: 8 }}>
        {videos.map(v => (
          <div key={v.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
            <strong>{v.title}</strong> — <em>{v.videoId}</em>
            <div style={{ marginTop: 6 }}>
              <a href={`/video/${v.videoId}`} target="_blank" rel="noreferrer">Open video page</a>
              <button onClick={() => createShare(v.videoId)} style={{ marginLeft: 8 }}>Create share link</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
