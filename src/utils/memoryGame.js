import { colors } from "@/constants/theme";
import { shuffle } from "@/utils/random";

export const LEVELS = [
  { key: "easy", label: "Easy", pairs: 4, cols: 2, ratio: 0.72, color: colors.success, baseXp: 10 },
  { key: "medium", label: "Medium", pairs: 6, cols: 3, ratio: 0.95, color: colors.gold, baseXp: 20 },
  { key: "hard", label: "Hard", pairs: 8, cols: 4, ratio: 1.1, color: colors.rose, baseXp: 35 },
];

export const MATCH_POINTS = 100;
export const WRONG_PENALTY = 10;
const PAR_SECONDS_PER_PAIR = 15;

// Score while playing: matches minus wrong tries, never below 0.
export function liveScore(matches, wrongs) {
  return Math.max(0, matches * MATCH_POINTS - wrongs * WRONG_PENALTY);
}

// Bonus for finishing faster than 15 seconds per pair.
export function timeBonus(pairs, seconds) {
  return Math.max(0, pairs * PAR_SECONDS_PER_PAIR - seconds) * 2;
}

// 3 stars: at most half as many wrong tries as pairs. 2 stars: up to 1.5 times. Otherwise 1.
export function starsFor(pairs, wrongs) {
  if (wrongs <= Math.floor(pairs / 2)) return 3;
  if (wrongs <= Math.floor(pairs * 1.5)) return 2;
  return 1;
}

export function xpFor(level, stars) {
  return level.baseXp + 5 * (stars - 1);
}

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Keeps only words that have both a Dzongkha word and a meaning, and removes duplicates,
// so there is never an ambiguous match.
export function usableWords(words) {
  const seenWord = new Set();
  const seenMeaning = new Set();
  const out = [];
  for (const w of words) {
    const word = (w.word || "").trim();
    const meaning = (w.meaning || "").trim();
    if (!word || !meaning) continue;
    const kw = word.toLowerCase();
    const km = meaning.toLowerCase();
    if (seenWord.has(kw) || seenMeaning.has(km)) continue;
    seenWord.add(kw);
    seenMeaning.add(km);
    out.push({ id: w.id, word, meaning });
  }
  return out;
}

// Picks `pairs` random words and makes two cards for each (word + meaning), then shuffles.
export function buildDeck(usable, pairs) {
  const chosen = shuffle(usable).slice(0, pairs);
  const cards = [];
  chosen.forEach((w) => {
    cards.push({ id: `${w.id}-w`, pairId: w.id, kind: "word", text: w.word });
    cards.push({ id: `${w.id}-m`, pairId: w.id, kind: "meaning", text: w.meaning });
  });
  return shuffle(cards);
}