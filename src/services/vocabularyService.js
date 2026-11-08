import { db } from "@/config/firebase";
import { XP } from "@/constants/rewards";
import { daySeed } from "@/utils/date";
import { makeId, shuffle } from "@/utils/random";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { recordActivity } from "./activityService";
import { awardBadge } from "./badgeService";
import { awardXp } from "./xpService";

const toWord = (id, d) => ({
  id, word: d.word || "", romanization: d.romanization || "", meaning: d.meaning || "", example: d.example || "",
});

export async function getAllWords() {
  const snap = await getDocs(collection(db, "vocabulary"));
  return snap.docs.map((d) => toWord(d.id, d.data())).sort((a, b) => a.word.localeCompare(b.word));
}

export async function saveWord({ id, word, romanization, meaning, example }) {
  const ref = id ? doc(db, "vocabulary", id) : doc(collection(db, "vocabulary"));
  await setDoc(ref, { word, romanization, meaning, example });
}

export const deleteWord = (id) => deleteDoc(doc(db, "vocabulary", id));

// The same word for everyone on the same day.
export function pickWordOfTheDay(words) {
  if (words.length === 0) return null;
  const sorted = [...words].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[daySeed() % sorted.length];
}

export async function getSavedIds(uid) {
  const snap = await getDocs(collection(db, "users", uid, "savedWords"));
  return new Set(snap.docs.map((d) => d.id));
}

export async function setSaved(uid, wordId, saved, totalSavedAfter) {
  const ref = doc(db, "users", uid, "savedWords", wordId);
  if (saved) {
    await setDoc(ref, { savedAt: Date.now() });
    if (totalSavedAfter >= 10) await awardBadge(uid, "word_collector");
  } else {
    await deleteDoc(ref);
  }
}

// "What does this word mean?" questions. Needs at least 4 words so there are 3 wrong options.
export function buildVocabQuestions(pool, all, count = 5) {
  if (all.length < 4) return [];
  const questions = [];
  for (const w of shuffle(pool).slice(0, count)) {
    const seen = new Set([w.meaning]);
    const wrong = [];
    for (const x of shuffle(all.filter((y) => y.id !== w.id))) {
      if (!seen.has(x.meaning)) { seen.add(x.meaning); wrong.push(x.meaning); }
      if (wrong.length === 3) break;
    }
    if (wrong.length < 3) continue; // not enough different meanings for this word
    const options = shuffle([w.meaning, ...wrong]);
    questions.push({ id: makeId(), text: w.word, speak: w.romanization, options, correctOptionIndex: options.indexOf(w.meaning), category: "Vocabulary" });  }
  return questions;
}

export async function finishVocabPractice(uid, correct, total) {
  const xp = correct * XP.VOCAB_CORRECT;
  if (xp > 0) await awardXp(uid, xp);
  await recordActivity(uid, { type: "vocab", correct, count: total });
  return xp;
}