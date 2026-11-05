import { db } from "@/config/firebase";
import { weekStartString } from "@/utils/date";
import { getLevelInfo } from "@/utils/level";
import { doc, runTransaction } from "firebase/firestore";
import { awardBadge } from "./badgeService";

// Adds XP (and weekly XP) safely, even if two things award XP at the same moment.
export async function awardXp(uid, amount) {
  const ref = doc(db, "users", uid);
  const { before, after } = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.data() || {};
    const current = d.xp ?? d.points ?? 0;
    const week = weekStartString();
    const weekly = d.weekStart === week ? d.weeklyXp ?? 0 : 0;
    tx.set(ref, { xp: current + amount, weeklyXp: weekly + amount, weekStart: week }, { merge: true });
    return { before: current, after: current + amount };
  });
  const levelBefore = getLevelInfo(before).level;
  const levelAfter = getLevelInfo(after).level;
  if (levelAfter >= 5) await awardBadge(uid, "level_5");
  return { xp: after, level: levelAfter, leveledUp: levelAfter > levelBefore };
}