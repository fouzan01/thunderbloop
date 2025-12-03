// ts/useReveal.ts
"use client";

import { useEffect } from "react";

export default function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("is-revealed");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
