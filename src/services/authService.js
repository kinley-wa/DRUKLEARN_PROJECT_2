import { auth } from "@/config/firebase";
import {
    createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut,
} from "firebase/auth";
import { createProfile, defaultProfile } from "./userService";

export function friendlyAuthError(e) {
  const code = (e && e.code) || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found": return "Incorrect email or password.";
    case "auth/email-already-in-use": return "That email is already registered.";
    case "auth/weak-password": return "Password must be at least 6 characters.";
    case "auth/invalid-email": return "Please enter a valid email address.";
    case "auth/network-request-failed": return "No internet connection.";
    default: return (e && e.message) || "Something went wrong.";
  }
}

export async function registerUser(fullName, email, password, role) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createProfile(defaultProfile(cred.user.uid, email, fullName, role));
}
export async function loginUser(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}
export const logoutUser = () => signOut(auth);
export const sendReset = (email) => sendPasswordResetEmail(auth, email);