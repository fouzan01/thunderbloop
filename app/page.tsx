// app/page.tsx
"use client";

import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Hero from "@/components/Hero";
import ThumbnailGrid from "@/components/ThumbnailGrid";
import "@/globals.css"; // keep using your globals

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-900 text-slate-50">
      <AnimatedBackground />
      <div className="relative z-10">
        <Hero />
        <section id="discover" className="py-12 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-6">
              Trending creators and highlights
            </h3>
            <p className="text-slate-300 max-w-2xl mb-8">
              Dive into curated thumbnails, top creators, and quick stats — designed to keep visitors
              engaged and coming back for more.
            </p>

            <ThumbnailGrid />
          </div>
        </section>
      </div>
    </main>
  );
}
