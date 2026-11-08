import { db } from "@/config/firebase";
import { colors } from "@/constants/theme";
import { daysBetween, toDateString } from "@/utils/date";
import { getLevelInfo } from "@/utils/level";
import { makeId } from "@/utils/random";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { saveLesson } from "./lessonService";
import { saveQuiz } from "./quizService";

export const pctColor = (p) => (p >= 80 ? colors.success : p >= 50 ? colors.amber : colors.error);

// ---------- students ----------
export async function getAllProgress() {
  const snap = await getDocs(collection(db, "progress"));
  return snap.docs.map((d) => d.data());
}

// { studentUid: number of lessons completed }, ignoring lessons that were deleted
export function completedByUser(progressAll, lessonIds) {
  const ids = new Set(lessonIds);
  const map = {};
  progressAll.forEach((p) => {
    if (p.completed && ids.has(p.lessonId)) map[p.userId] = (map[p.userId] || 0) + 1;
  });
  return map;
}

export function daysSinceActive(dateStr) {
  if (!dateStr) return null;
  return daysBetween(dateStr, toDateString());
}

export function lastActiveLabel(dateStr) {
  const d = daysSinceActive(dateStr);
  if (d === null) return "Never";
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

// notstarted = no XP yet, inactive = not opened the app for 3+ days, otherwise active
export function studentStatus(p) {
  if (!p.xp) return "notstarted";
  const d = daysSinceActive(p.lastActiveDate);
  return d !== null && d >= 3 ? "inactive" : "active";
}

export function buildClassReport({ students, lessonsCount, doneMap }) {
  const n = students.length;
  const active = students.filter((x) => studentStatus(x) === "active").length;
  const avgXp = n ? Math.round(students.reduce((a, x) => a + x.xp, 0) / n) : 0;
  const totalDone = students.reduce((a, x) => a + (doneMap[x.uid] || 0), 0);
  const avgDone = n && lessonsCount ? Math.round((totalDone / (n * lessonsCount)) * 100) : 0;
  const lines = [
    `DrukLearn class report - ${toDateString()}`,
    `Students: ${n} (${active} active)`,
    `Lessons: ${lessonsCount}   Average XP: ${avgXp}   Average lesson completion: ${avgDone}%`,
    "",
  ];
  [...students].sort((a, b) => b.xp - a.xp).forEach((x, i) => {
    lines.push(
      `${i + 1}. ${x.fullName || "Unnamed"} - ${x.xp} XP, level ${getLevelInfo(x.xp).level}, ` +
      `lessons ${doneMap[x.uid] || 0}/${lessonsCount}, streak ${x.streak}, last opened ${lastActiveLabel(x.lastActiveDate)}`
    );
  });
  return lines.join("\n");
}

// Per-topic accuracy of one student (needs the topicStats rules change).
export async function getStudentTopicStats(uid) {
  const snap = await getDocs(collection(db, "users", uid, "topicStats"));
  return snap.docs
    .map((d) => {
      const x = d.data();
      const correct = x.correct || 0;
      const wrong = x.wrong || 0;
      const total = correct + wrong;
      return { category: x.category, correct, wrong, total, accuracy: total ? correct / total : 1 };
    })
    .filter((t) => t.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy);
}

// ---------- content ----------
export async function duplicateLesson(lesson, uid) {
  const { id, updatedAt, ...rest } = lesson;
  await saveLesson({ ...rest, title: `${lesson.title} (copy)`, createdBy: uid });
}

export async function duplicateQuiz(quiz, uid) {
  const { id, updatedAt, publishedAt, ...rest } = quiz;
  await saveQuiz({
    ...rest, title: `${quiz.title} (copy)`, createdBy: uid,
    questions: quiz.questions.map((q) => ({ ...q, id: makeId() })),
  });
}

// ---------- quiz results ----------
export async function getQuizStats(quiz) {
  const snap = await getDocs(query(collection(db, "attempts"), where("quizId", "==", quiz.id)));
  const attempts = snap.docs.map((d) => d.data()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const pcts = attempts.map((a) => (a.total ? (a.score / a.total) * 100 : 0));
  const avg = pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : 0;
  const best = pcts.length ? Math.round(Math.max(...pcts)) : 0;
  const students = new Set(attempts.map((a) => a.userId)).size;

  const miss = {};
  attempts.forEach((a) => (a.details || []).forEach((d) => {
    const m = miss[d.questionId] || (miss[d.questionId] = { wrong: 0, total: 0 });
    m.total += 1;
    if (!d.correct) m.wrong += 1;
  }));
  const hardest = quiz.questions
    .map((q) => (miss[q.id] && miss[q.id].total ? { question: q, wrong: miss[q.id].wrong, total: miss[q.id].total, rate: miss[q.id].wrong / miss[q.id].total } : null))
    .filter(Boolean)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  return { attempts, avg, best, students, hardest };
}

// ---------- competition ----------
export async function getCompetitionAttemptsAll(comp) {
  const key = String(comp.publishedAt ?? 0);
  const snap = await getDocs(query(collection(db, "competition_attempts"), where("competitionKey", "==", key)));
  return snap.docs.map((d) => d.data()).sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);
}

// Students stop seeing the challenge. Saved results are kept.
export const unpublishCompetition = () => deleteDoc(doc(db, "competitions", "weekly"));