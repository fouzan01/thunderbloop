// components/ThumbnailGrid.tsx
"use client";

import React from "react";
import useReveal from "@/ts/useReveal";

type Item = {
  id: string;
  title: string;
  creator: string;
  views: string;
  thumb: string;
  points: number;
};

const SAMPLE: Item[] = [
  {
    id: "1",
    title: "Design system micro-tutorial",
    creator: "LunaArt",
    views: "42k",
    thumb: "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=1200&q=60",
    points: 420,
  },
  {
    id: "2",
    title: "Fast growth hacks 2025",
    creator: "GrowthGuy",
    views: "101k",
    thumb: "https://images.unsplash.com/photo-1523473827532-9a1e2d0f7a21?w=1200&q=60",
    points: 880,
  },
  {
    id: "3",
    title: "Thumbnail mastery",
    creator: "PixelWizard",
    views: "1.2M",
    thumb: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=60",
    points: 1240,
  },
  {
    id: "4",
    title: "Shorts that convert",
    creator: "ShortsPro",
    views: "80k",
    thumb: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=60",
    points: 610,
  },
  {
    id: "5",
    title: "Script to RT",
    creator: "Writerly",
    views: "36k",
    thumb: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=60",
    points: 305,
  },
  {
    id: "6",
    title: "Profile optimization",
    creator: "BrandUp",
    views: "56k",
    thumb: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=60",
    points: 410,
  },
];

export default function ThumbnailGrid(): JSX.Element {
  useReveal();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {SAMPLE.map((it) => (
        <article
          data-reveal
          key={it.id}
          className="transform transition-shadow duration-300 hover:shadow-2xl rounded-xl overflow-hidden bg-white/4 border border-white/6"
        >
          <div className="relative aspect-video">
            <img src={it.thumb} alt={it.title} className="object-cover w-full h-full" />
            <div className="absolute left-3 top-3 text-xs bg-black/50 text-white px-2 py-1 rounded">{it.views} views</div>
            <div className="absolute right-3 bottom-3">
              <div className="bg-gradient-to-r from-amber-400 to-pink-500 text-black text-xs px-3 py-1 rounded font-semibold">
                {it.points} pts
              </div>
            </div>
            <div className="thumbnail-shimmer" />
          </div>

          <div className="p-4">
            <h4 className="font-semibold truncate">{it.title}</h4>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div>
                  <div className="font-medium text-slate-100">{it.creator}</div>
                  <div className="text-xs text-slate-400">Creator</div>
                </div>
              </div>

              <button className="px-3 py-1 bg-white/6 rounded hover:bg-white/10">View</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
