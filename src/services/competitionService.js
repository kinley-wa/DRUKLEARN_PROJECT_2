import { db } from "@/config/firebase";
import { XP } from "@/constants/rewards";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { normalizeQuiz } from "./quizService";
import { awardXp } from "./xpService";

const compRef = () => doc(db, "competitions", "weekly");
const keyOf = (c) => String(c.publishedAt ?? 0);
const attemptId = (uid, key) => `${uid}_${key}`;

export async function getCompetition() {
  const snap = await getDoc(compRef());
  if (!snap.exists()) return null;
  const comp = normalizeQuiz("weekly", snap.data());
  return comp.questions.length ? comp : null;
}

export async function saveCompetition(input) {
  const clean = JSON.parse(JSON.stringify(input));
  await setDoc(compRef(), { ...clean, id: "weekly", updatedAt: Date.now(), publishedAt: Date.now() });
}

// One attempt per student per published competition (the document id enforces it).
export async function hasAttempted(uid, comp) {
  const snap = await getDoc(doc(db, "competition_attempts", attemptId(uid, keyOf(comp))));
  return snap.exists();
}

export async function submitCompetition({ uid, userName, comp, score }) {
  const key = keyOf(comp);
  const xpEarned = score * XP.COMPETITION_CORRECT;
  const id = attemptId(uid, key);
  await setDoc(doc(db, "competition_attempts", id), {
    id, userId: uid, userName, quizId: "weekly", score, total: comp.questions.length,
    xpEarned, details: [], timestamp: Date.now(), competitionKey: key,
  });
  if (xpEarned > 0) await awardXp(uid, xpEarned);
  return xpEarned;
}

export async function getCompetitionLeaderboard(comp) {
  const snap = await getDocs(query(collection(db, "competition_attempts"), where("competitionKey", "==", keyOf(comp))));
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => b.score - a.score || a.timestamp - b.timestamp)
    .slice(0, 10);
}