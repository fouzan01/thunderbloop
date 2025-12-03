// lib/authHelpers.ts
import {
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  sendEmailVerification as fbSendEmailVerification,
  signInWithCredential,
  GoogleAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  User,
} from "firebase/auth";
import { auth } from "./firebaseClient";

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string) {
  await fbSendPasswordResetEmail(auth, email);
}

/**
 * Send email verification to currently signed-in user.
 * Call this after creating user (createUserWithEmailAndPassword).
 */
export async function sendVerificationToCurrentUser(user: User | null) {
  if (!user) throw new Error("No user signed in");
  await fbSendEmailVerification(user);
}

/**
 * Link a Google credential to the currently signed-in user (used if user is already signed in).
 */
export async function linkGoogleToCurrentUser(idToken: string, accessToken?: string) {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const user = auth.currentUser;
  if (!user) throw new Error("No current user");
  return linkWithCredential(user, credential);
}

/**
 * Attempt to resolve a Google sign-in conflict:
 * If a Firebase account already exists with the same email, return the sign-in methods for that email.
 */
export async function getSignInMethodsFor(email: string) {
  return fetchSignInMethodsForEmail(auth, email);
}

/**
 * Create a Google credential for sign-in linking flow (given the Google provider result)
 * Example usage is shown below in the client code that handles Google sign-in.
 */
export function googleCredentialFromResult(googleResult: any) {
  // googleResult is provider result from signInWithPopup or signInWithRedirect
  // For example: result.credential?.idToken, result.credential?.accessToken
  const idToken = googleResult?.credential?.idToken || null;
  const accessToken = googleResult?.credential?.accessToken || null;
  if (!idToken) throw new Error("No idToken in google result");
  return GoogleAuthProvider.credential(idToken, accessToken);
}
