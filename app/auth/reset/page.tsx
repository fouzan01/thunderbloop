"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode");

  const [step, setStep] = useState<"loading" | "form" | "expired" | "error">(
    "loading"
  );
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setError("Missing reset code.");
      setStep("error");
      return;
    }

    // Verify code to get the user's email and check validity
    verifyPasswordResetCode(auth, oobCode)
      .then((emailFromCode) => {
        setEmail(emailFromCode);
        setStep("form");
      })
      .catch((err: any) => {
        const code = err?.code ?? "";
        if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
          setStep("expired");
        } else {
          setError(err?.message ?? "Invalid reset link.");
          setStep("error");
        }
      });
  }, [oobCode]);

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || newPassword.length < 6) {
      setError("Use a stronger password (6+ characters).");
      return;
    }
    if (!oobCode) {
      setError("Missing reset code.");
      return;
    }
    setConfirming(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("Password updated — you can sign in now.");
      // optional: redirect to login after short delay
      setTimeout(() => router.push("/auth/login"), 1800);
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
        setError("This reset link is invalid or expired. Request a new link.");
        setStep("expired");
      } else {
        setError(err?.message ?? "Failed to reset password.");
      }
    } finally {
      setConfirming(false);
    }
  };

  const resendReset = async () => {
    setError(null);
    setStatus(null);
    setSending(true);
    try {
      // If we know the email already, use it; otherwise ask user to type it
      const targetEmail = email || window.prompt("Enter your email for password reset:");
      if (!targetEmail) throw new Error("Email required.");

      await sendPasswordResetEmail(auth, targetEmail);
      setStatus("Reset email sent. Check your inbox and spam.");
      setStep("form"); // allow them to wait for new code
    } catch (err: any) {
      setError(err?.message ?? "Failed to send reset email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "48px auto", padding: 20 }}>
      <h1>Reset password</h1>

      {step === "loading" && <p>Verifying link…</p>}

      {step === "form" && (
        <>
          <p>Resetting password for: <strong>{email}</strong></p>

          <form onSubmit={onConfirm}>
            <label style={{ display: "block", marginTop: 8 }}>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
              />
            </label>

            <button type="submit" disabled={confirming} style={{ marginTop: 12 }}>
              {confirming ? "Saving…" : "Set new password"}
            </button>
          </form>

          {status && <div style={{ color: "green", marginTop: 12 }}>{status}</div>}
          {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}
        </>
      )}

      {step === "expired" && (
        <>
          <p style={{ color: "#b00" }}>
            The password reset link is invalid or has expired.
          </p>

          <div style={{ marginTop: 12 }}>
            <button onClick={resendReset} disabled={sending}>
              {sending ? "Sending…" : "Send new password reset email"}
            </button>
          </div>

          <p style={{ marginTop: 12, color: "#666" }}>
            If you don't receive the email, check your spam/junk folder and try again.
          </p>

          {status && <div style={{ color: "green", marginTop: 12 }}>{status}</div>}
          {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}
        </>
      )}

      {step === "error" && (
        <>
          <p style={{ color: "crimson" }}>{error ?? "Invalid request."}</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => router.push("/auth/forgot")}>Request new reset</button>
          </div>
        </>
      )}
    </div>
  );
}
