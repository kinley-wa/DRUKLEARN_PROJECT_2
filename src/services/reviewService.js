import { XP } from "@/constants/rewards";
import { shuffle } from "@/utils/random";
import { recordActivity } from "./activityService";
import { getAllQuizzes } from "./quizService";
import { awardXp } from "./xpService";

// Up to 5 practice questions taken from the teachers' quizzes for the given topic.
export async function buildReviewQuestions(category) {
  const quizzes = await getAllQuizzes();
  const pool = [];
  for (const q of quizzes) {
    if ((q.category || "General") === category) {
      pool.push(...q.questions.map((x) => ({ ...x, category })));
    }
  }
  return shuffle(pool).slice(0, 5);
}

export async function finishReview(uid, correct, details) {
  const xp = correct * XP.REVIEW_CORRECT;
  if (xp > 0) await awardXp(uid, xp);
  // also updates the topic stats, so a topic stops being "weak" once you improve
  await recordActivity(uid, { type: "review", correct, details });
  return xp;
}