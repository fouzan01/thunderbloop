// components/Hero.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useReveal from "@/ts/useReveal";

export default function Hero(): JSX.Element {
  const router = useRouter();
  useReveal();

  const user = {
    nickname: "PixelWizard",
    points: 1240,
    avatar: "https://i.pravatar.cc/96?img=5",
  };

  return (
    <header className="pt-24 pb-12 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div
            data-reveal
            className="reveal-card inline-flex items-center gap-4 bg-white/5 p-2 rounded-full backdrop-blur-sm border border-white/6"
          >
            <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full ring-1 ring-white/10" />
            <div className="text-sm">
              <div className="font-semibold">{user.nickname}</div>
              <div className="text-xs text-slate-300">Creator · {user.points} points</div>
            </div>
            <div className="ml-4 px-3 py-1 text-xs bg-gradient-to-r from-amber-400 to-pink-500 text-black rounded-full font-semibold">
              + Featured
            </div>
          </div>

          <h1 data-reveal className="reveal-title text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Grow your presence. <span className="text-gradient">Captivate your audience.</span>
          </h1>

          <p data-reveal className="text-lg md:text-xl text-slate-300 max-w-2xl">
            Aesthetic-first layouts, subtle motion, and meaningful thumbnails that convert visitors into
            followers. Designed to feel premium — built to scale.
          </p>

          <div data-reveal className="flex gap-4 mt-4">
            <button
              onClick={() => router.push("/auth/signup")}
              className="btn-primary px-6 py-3 rounded-lg font-semibold shadow-lg"
            >
              Get started — it's free
            </button>

            <button
              onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-ghost px-6 py-3 rounded-lg font-medium border border-white/6"
            >
              Discover creators
            </button>
          </div>

          <div data-reveal className="mt-6">
            <div className="flex gap-3 items-center text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>Live events · Trending · New drops</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div data-reveal className="reveal-card p-1 rounded-2xl bg-gradient-to-br from-white/5 to-white/3 border border-white/8 overflow-hidden">
            <div className="p-6 bg-slate-900 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-300">Top clip — 1.2M views</div>
                <div className="text-xs text-slate-400">3d ago</div>
              </div>

              <div className="rounded-lg overflow-hidden shadow-md">
                <div className="aspect-video bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-end p-4">
                  <div className="text-sm font-bold text-white">Make microcontent that matters</div>
                </div>

                <div className="p-4 bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">PixelWizard</div>
                    <div className="text-xs text-slate-400">1.2M views • 65% retention</div>
                  </div>
                  <div className="text-sm px-3 py-1 bg-white/5 rounded">{user.points} pts</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="flex-1 bg-amber-400 text-black px-4 py-2 rounded font-semibold">Promote</button>
                <button className="flex-1 border border-white/6 px-4 py-2 rounded">Save</button>
              </div>
            </div>
          </div>

          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-2xl bg-gradient-to-br from-white/3 to-white/6 blur-md opacity-40 transform rotate-6" />
        </div>
      </div>
    </header>
  );
}
