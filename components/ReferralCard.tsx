// components/ReferralCard.tsx
"use client";

import React from "react";

export default function ReferralCard({ points }: { points: number }): JSX.Element {
  const code = "TB-" + (Math.random() * 9000 + 1000 | 0);
  return (
    <div className="rounded-lg p-4 bg-white/6">
      <h4 className="font-semibold">Invite & earn</h4>
      <p className="text-sm text-slate-300 my-2">Share your referral and earn points when people sign up.</p>

      <div className="flex items-center gap-2">
        <div className="px-3 py-2 bg-black/20 rounded font-mono text-sm">{code}</div>
        <button
          onClick={() => { navigator.clipboard?.writeText(code); alert("Copied referral code"); }}
          className="px-3 py-2 bg-amber-400 rounded text-black font-semibold"
        >
          Copy
        </button>
      </div>

      <div className="mt-3 text-sm text-slate-300">
        Your balance: <span className="font-semibold text-white">{points} pts</span>
      </div>
    </div>
  );
}
