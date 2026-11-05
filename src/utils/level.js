import { XP_PER_LEVEL } from "@/constants/rewards";

export function getLevelInfo(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return { level, xpIntoLevel, xpForNext: XP_PER_LEVEL, progress: xpIntoLevel / XP_PER_LEVEL };
}