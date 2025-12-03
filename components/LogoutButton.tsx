"use client";

import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function LogoutButton(): React.ReactElement {
  async function handleLogout() {
    try {
      await signOut(auth);
      // Optionally redirect using next/navigation in a client component
      // const router = useRouter(); router.push("/auth/login");
    } catch (e) {
      // handle error if needed
      console.error("Sign out failed", e);
    }
  }

  return (
    <button onClick={handleLogout} style={{ padding: "8px 12px" }}>
      Sign out
    </button>
  );
}
