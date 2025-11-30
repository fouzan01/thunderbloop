"use client";

import LogoutButton from "@/components/LogoutButton";
import { auth } from "@/lib/firebaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) {
        router.replace("/auth/login");
      } else {
        setEmail(u.email ?? null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {email}</p>

      <div style={{ marginTop: 16 }}>
        <LogoutButton />
      </div>
    </div>
  );
}
