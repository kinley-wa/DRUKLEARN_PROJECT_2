import { db } from "@/config/firebase";
import { daysBetween, toDateString } from "@/utils/date";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { awardBadge } from "./badgeService";

// Same rules as Project I: same day = no change, next day = +1, any gap = reset to 1.
export async function updateStreak(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  const d = snap.data();
  if (d.role === "teacher") return 0;
  const today = toDateString();
  const last = d.lastActiveDate || "";
  const current = d.streak || 0;
  if (last === today) return current;
  let next = 1;
  if (last) {
    const gap = daysBetween(last, today);
    next = gap === 1 ? current + 1 : gap > 1 ? 1 : current;
  }
  await updateDoc(ref, { streak: next, lastActiveDate: today });
  if (next >= 5) await awardBadge(uid, "5_day_streak");
  if (next >= 14) await awardBadge(uid, "hot_streak_14");
  return next;
}