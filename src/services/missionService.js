import { db } from "@/config/firebase";
import { MISSION_POOL } from "@/constants/missions";
import { daySeed, toDateString } from "@/utils/date";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { awardXp } from "./xpService";

const ref = (uid, date) => doc(db, "users", uid, "dailyMissions", date);

// 3 missions per day, rotating through the pool so every day is different
function pickIds(seed) {
  const n = MISSION_POOL.length;
  return [0, 1, 2].map((i) => MISSION_POOL[(seed + i) % n].id);
}

export async function getTodayMissions(uid) {
  const date = toDateString();
  const snap = await getDoc(ref(uid, date));
  let data;
  if (snap.exists()) {
    data = snap.data();
  } else {
    data = { date, ids: pickIds(daySeed()), progress: {}, claimed: {} };
    await setDoc(ref(uid, date), data);
  }
  const defs = data.ids.map((id) => MISSION_POOL.find((m) => m.id === id)).filter(Boolean);
  return { data, defs };
}

// Adds progress to today's missions and awards the XP as soon as a mission is completed.
// type: lesson | quiz | vocab | review.  correct: correct answers.  count: units of activity.
export async function addMissionProgress(uid, type, correct = 0, count = 1) {
  const { data, defs } = await getTodayMissions(uid);
  const progress = { ...data.progress };
  const claimed = { ...data.claimed };
  let changed = false;
  let xp = 0;
  for (const m of defs) {
    if (claimed[m.id]) continue;
    const inc = m.type === "correct" ? correct : m.type === type ? count : 0;
    if (inc <= 0) continue;
    progress[m.id] = (progress[m.id] || 0) + inc;
    changed = true;
    if (progress[m.id] >= m.target) { claimed[m.id] = true; xp += m.xp; }
  }
  if (changed) await setDoc(ref(uid, data.date), { ...data, progress, claimed });
  if (xp > 0) await awardXp(uid, xp);
}