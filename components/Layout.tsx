// components/Layout.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-transparent px-6 py-4 border-b border-white/6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">Thunderbloop</Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm">Dashboard</Link>
            <Link href="/leaderboard" className="text-sm">Leaderboard</Link>
            <Link href="/auth/login" className="text-sm">Login</Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
