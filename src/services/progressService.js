import { db } from "@/config/firebase";
import { XP } from "@/constants/rewards";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { recordActivity } from "./activityService";
import { awardBadge } from "./badgeService";
import { awardXp } from "./xpService";

// One query for all of a student's progress (Project I did one read per lesson).
export async function getProgressForUser(uid) {
  const snap = await getDocs(query(collection(db, "progress"), where("userId", "==", uid)));
  return snap.docs.map((d) => d.data());
}

export async function saveLessonProgress({ uid, lesson, sectionsCompleted, wasCompleted }) {
  const total = lesson.sections.length;
  const none = { newlyCompleted: false, xpEarned: 0, leveledUp: false };
  // a finished lesson is never overwritten, so its XP cannot be earned twice
  if (wasCompleted) return none;

  const percent = total > 0 ? Math.min(100, Math.round((sectionsCompleted / total) * 100)) : 0;
  const progress = {
    userId: uid, lessonId: lesson.id, sectionsCompleted, percent,
    completed: percent >= 100, lastUpdated: Date.now(),
  };
  await setDoc(doc(db, "progress", `${uid}_${lesson.id}`), progress);
  if (!progress.completed) return none;

  const xp = await awardXp(uid, XP.LESSON_COMPLETE);
  const done = (await getProgressForUser(uid)).filter((x) => x.completed).length;
  if (done >= 10) await awardBadge(uid, "10_lessons");
  await recordActivity(uid, { type: "lesson" });
  return { newlyCompleted: true, xpEarned: XP.LESSON_COMPLETE, leveledUp: xp.leveledUp };
}