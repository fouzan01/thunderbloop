// components/AnimatedBackground.tsx
"use client";

import React from "react";

export default function AnimatedBackground(): JSX.Element {
  return (
    <div aria-hidden className="animated-bg fixed inset-0 -z-10 overflow-hidden">
      <div className="gradient-orb" />

      <div className="dots-layer">
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={i} className={`dot dot-${i % 6}`} />
        ))}
      </div>

      <div className="vignette" />
    </div>
  );
}
