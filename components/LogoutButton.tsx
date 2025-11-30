"use client";

import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import React from "react";

export default function LogoutButton({ label = "Logout" }: { label?: string }) {
  const router = useRouter();

  const onLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/auth/login");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Sign out failed:", err);
    }
  };

  return (
    <button
      onClick={onLogout}
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
