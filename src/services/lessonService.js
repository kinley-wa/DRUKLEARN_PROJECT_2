import { db } from "@/config/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export function normalizeLesson(id, d) {
  return {
    id, title: d.title || "", level: d.level || "Beginner", category: d.category || "",
    lessonType: d.lessonType || "Vocabulary", sections: d.sections || [],
    accessCode: d.accessCode || "", createdBy: d.createdBy || "", updatedAt: d.updatedAt || 0,
  };
}

export async function getAllLessons() {
  const snap = await getDocs(collection(db, "lessons"));
  return snap.docs.map((d) => normalizeLesson(d.id, d.data()));
}

export async function getLesson(id) {
  const snap = await getDoc(doc(db, "lessons", id));
  return snap.exists() ? normalizeLesson(snap.id, snap.data()) : null;
}

// pass `id` to edit an existing lesson, leave it out to create a new one
export async function saveLesson(input) {
  const { id, ...rest } = input;
  const ref = id ? doc(db, "lessons", id) : doc(collection(db, "lessons"));
  await setDoc(ref, { ...rest, id: ref.id, updatedAt: Date.now() });
}

export const deleteLesson = (id) => deleteDoc(doc(db, "lessons", id));