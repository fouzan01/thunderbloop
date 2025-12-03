"use client";
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function LogoutButton(): React.ReactElement {
  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }
  return <button onClick={handleLogout} style={{ padding: "8px 12px" }}>Sign out</button>;
}
