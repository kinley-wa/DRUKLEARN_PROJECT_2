import { db } from "@/config/firebase";
import { collection, doc, getDocs, increment, setDoc } from "firebase/firestore";

const MIN_ANSWERS = 3;   // answers needed before a topic can be judged
const WEAK_BELOW = 0.7;  // under 70% accuracy counts as weak

export async function recordTopicResults(uid, details) {
  const byCat = {};
  for (const d of details) {
    const k = d.category || "General";
    if (!byCat[k]) byCat[k] = { c: 0, w: 0 };
    if (d.correct) byCat[k].c += 1; else byCat[k].w += 1;
  }
  await Promise.all(Object.entries(byCat).map(([category, v]) =>
    setDoc(
      doc(db, "users", uid, "topicStats", encodeURIComponent(category)),
      { category, correct: increment(v.c), wrong: increment(v.w), updatedAt: Date.now() },
      { merge: true }
    )));
}

export async function getWeakTopics(uid) {
  const snap = await getDocs(collection(db, "users", uid, "topicStats"));
  return snap.docs
    .map((d) => {
      const x = d.data();
      const total = (x.correct || 0) + (x.wrong || 0);
      return { category: x.category, total, accuracy: total ? (x.correct || 0) / total : 1 };
    })
    .filter((t) => t.total >= MIN_ANSWERS && t.accuracy < WEAK_BELOW && t.category !== "Vocabulary")
    .sort((a, b) => a.accuracy - b.accuracy);
}