import { db } from "@/config/firebase";
import { XP } from "@/constants/rewards";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { recordActivity } from "./activityService";
import { awardBadge } from "./badgeService";
import { awardXp } from "./xpService";

export function normalizeQuiz(id, d) {
  return {
    id, title: d.title || "", lessonId: d.lessonId || "", lessonTitle: d.lessonTitle || "",
    category: d.category || "", timeLimitMinutes: d.timeLimitMinutes ?? 10, questions: d.questions || [],
    accessCode: d.accessCode || "", createdBy: d.createdBy || "", updatedAt: d.updatedAt || 0,
    publishedAt: d.publishedAt,
  };
}

export async function getAllQuizzes() {
  const snap = await getDocs(collection(db, "quizzes"));
  return snap.docs.map((d) => normalizeQuiz(d.id, d.data()));
}

export async function getQuiz(id) {
  const snap = await getDoc(doc(db, "quizzes", id));
  return snap.exists() ? normalizeQuiz(snap.id, snap.data()) : null;
}

export async function saveQuiz(input) {
  const { id, ...rest } = input;
  const ref = id ? doc(db, "quizzes", id) : doc(collection(db, "quizzes"));
  const clean = JSON.parse(JSON.stringify(rest)); // drops undefined values, which Firestore rejects
  await setDoc(ref, { ...clean, id: ref.id, updatedAt: Date.now() });
}

export const deleteQuiz = (id) => deleteDoc(doc(db, "quizzes", id));

export async function getAttemptsForUser(uid) {
  const snap = await getDocs(query(collection(db, "attempts"), where("userId", "==", uid)));
  return snap.docs.map((d) => d.data());
}

export async function finishQuiz({ uid, userName, quiz, score, details }) {
  const total = quiz.questions.length;
  const xpEarned = score * XP.QUIZ_CORRECT;
  const ref = doc(collection(db, "attempts"));
  await setDoc(ref, {
    id: ref.id, userId: uid, userName, quizId: quiz.id, score, total,
    xpEarned, details, timestamp: Date.now(),
  });
  const xp = xpEarned > 0 ? await awardXp(uid, xpEarned) : null;
  if (total > 0 && score === total) await awardBadge(uid, "perfect_score");
  const count = (await getAttemptsForUser(uid)).length;
  if (count >= 5) await awardBadge(uid, "quiz_master");
  await recordActivity(uid, { type: "quiz", correct: score, details });
  return { xpEarned, leveledUp: xp ? xp.leveledUp : false };
}