import { db } from "@/config/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

const toTopic = (id, d) => ({ id, title: d.title || "", category: d.category || "", order: d.order ?? 0 });

export async function getTopics() {
  const snap = await getDocs(collection(db, "topics"));
  return snap.docs.map((d) => toTopic(d.id, d.data()));
}
export async function getTopic(id) {
  const s = await getDoc(doc(db, "topics", id));
  return s.exists() ? toTopic(s.id, s.data()) : null;
}
export async function saveTopic({ id, title, category, order }) {
  const ref = id ? doc(db, "topics", id) : doc(collection(db, "topics"));
  await setDoc(ref, { title, category, order });
  return ref.id;
}
export const deleteTopic = (id) => deleteDoc(doc(db, "topics", id));

// A topic unlocks when the previous topic that has lessons is fully completed.
// If the teacher created no topics, the path is built from lesson categories instead.
export function buildPath(topics, lessons, progress) {
  let list = topics;
  if (list.length === 0) {
    const cats = Array.from(new Set(lessons.map((l) => l.category).filter(Boolean)));
    list = cats.map((c, i) => ({ id: c, title: c, category: c, order: i + 1 }));
  }
  let prevCompleted = true;
  return [...list].sort((a, b) => a.order - b.order).map((topic) => {
    const ls = lessons.filter((l) => l.category === topic.category);
    const done = ls.filter((l) => progress[l.id] && progress[l.id].completed).length;
    const completed = ls.length > 0 && done === ls.length;
    const state = completed ? "completed" : prevCompleted && ls.length > 0 ? "unlocked" : "locked";
    if (ls.length > 0) prevCompleted = completed;
    return { topic, total: ls.length, done, state };
  });
}