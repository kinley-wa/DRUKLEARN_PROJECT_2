import { db } from "@/config/firebase";
import { MAX_HEARTS } from "@/constants/rewards";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";

export function defaultProfile(uid, email, fullName = "", role = "student") {
  return {
    uid, fullName, email, role, xp: 0, weeklyXp: 0, weekStart: "", streak: 0, lastActiveDate: "",
    badges: [], hearts: MAX_HEARTS, heartsUpdatedAt: Date.now(), createdAt: Date.now(),
  };
}

// Also understands Project I users, which only have `points`.
export function normalizeProfile(uid, d) {
  return {
    uid, fullName: d.fullName || "", email: d.email || "", role: d.role === "teacher" ? "teacher" : "student",
    xp: d.xp ?? d.points ?? 0, weeklyXp: d.weeklyXp ?? 0, weekStart: d.weekStart || "",
    streak: d.streak ?? 0, lastActiveDate: d.lastActiveDate || "", badges: d.badges || [],
    hearts: d.hearts ?? MAX_HEARTS, heartsUpdatedAt: d.heartsUpdatedAt ?? Date.now(), createdAt: d.createdAt ?? 0,
  };
}

export async function createProfile(profile) {
  await setDoc(doc(db, "users", profile.uid), profile);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? normalizeProfile(uid, snap.data()) : null;
}

// Adds the Project II fields to Project I accounts. Returns false if the profile doc doesn't exist yet.
export async function ensureUserDefaults(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const d = snap.data();
  const patch = {};
  if (d.xp === undefined) patch.xp = d.points ?? 0;
  if (d.weeklyXp === undefined) { patch.weeklyXp = 0; patch.weekStart = ""; }
  if (d.hearts === undefined) { patch.hearts = MAX_HEARTS; patch.heartsUpdatedAt = Date.now(); }
  if (Object.keys(patch).length) await updateDoc(ref, patch);
  return true;
}

export async function updateUserName(uid, fullName) {
  await updateDoc(doc(db, "users", uid), { fullName });
}

export async function getAllStudents() {
  const snap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
  return snap.docs.map((d) => normalizeProfile(d.id, d.data())).sort((a, b) => b.xp - a.xp);
}