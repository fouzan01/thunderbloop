// components/Leaderboard.tsx
"use client";

import React from "react";

type Row = { rank: number; name: string; points: number; avatar?: string };

const SAMPLE: Row[] = [
  { rank: 1, name: "PixelWizard", points: 1240, avatar: "https://i.pravatar.cc/40?img=5" },
  { rank: 2, name: "GrowthGuy", points: 880, avatar: "https://i.pravatar.cc/40?img=12" },
  { rank: 3, name: "LunaArt", points: 420, avatar: "https://i.pravatar.cc/40?img=8" },
  { rank: 4, name: "ShortsPro", points: 610, avatar: "https://i.pravatar.cc/40?img=20" },
];

export default function Leaderboard(): JSX.Element {
  return (
    <div className="rounded-lg bg-white/5 p-4">
      <div className="grid grid-cols-12 gap-4 font-semibold text-sm pb-3 border-b border-white/6 mb-3">
        <div className="col-span-1">#</div>
        <div className="col-span-7">Creator</div>
        <div className="col-span-4 text-right">Points</div>
      </div>

      <ul className="space-y-2">
        {SAMPLE.map((r) => (
          <li key={r.rank} className="grid grid-cols-12 gap-4 items-center p-2 rounded hover:bg-white/6 transition">
            <div className="col-span-1 text-slate-200">{r.rank}</div>
            <div className="col-span-7 flex items-center gap-3">
              <img src={r.avatar} className="w-9 h-9 rounded-full" alt={r.name} />
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-slate-400">Creator</div>
              </div>
            </div>
            <div className="col-span-4 text-right font-semibold">{r.points}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
