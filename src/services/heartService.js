import { db } from "@/config/firebase";
import { HEART_REGEN_MINUTES, MAX_HEARTS } from "@/constants/rewards";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const INTERVAL = HEART_REGEN_MINUTES * 60000;

// stored = hearts when the timer started, updatedAt = when it started.
export function computeHearts(stored, updatedAt, now = Date.now()) {
  if (stored >= MAX_HEARTS) return { hearts: MAX_HEARTS, nextInMs: 0, regen: 0 };
  const regen = Math.floor((now - updatedAt) / INTERVAL);
  const hearts = Math.min(MAX_HEARTS, stored + regen);
  const nextInMs = hearts >= MAX_HEARTS ? 0 : INTERVAL - ((now - updatedAt) % INTERVAL);
  return { hearts, nextInMs, regen };
}

export async function getHearts(uid) {
  const d = (await getDoc(doc(db, "users", uid))).data() || {};
  return computeHearts(d.hearts ?? MAX_HEARTS, d.heartsUpdatedAt ?? Date.now());
}

export async function loseHeart(uid) {
  const ref = doc(db, "users", uid);
  const d = (await getDoc(ref)).data() || {};
  const stored = d.hearts ?? MAX_HEARTS;
  const updatedAt = d.heartsUpdatedAt ?? Date.now();
  const c = computeHearts(stored, updatedAt);
  if (c.hearts <= 0) return 0;
  const left = c.hearts - 1;
  // keep the regeneration timer correct: advance it by the hearts already regenerated
  const newUpdated = stored >= MAX_HEARTS ? Date.now() : updatedAt + c.regen * INTERVAL;
  await updateDoc(ref, { hearts: left, heartsUpdatedAt: newUpdated });
  return left;
}