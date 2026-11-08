import { toDateString } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { recordActivity } from "./activityService";
import { awardXp } from "./xpService";

export const MAX_REWARDED_PER_DAY = 5;
const keyFor = (uid) => `druklearn:memory:${uid}:${toDateString()}`;

// Gives the XP (up to 5 games a day) and counts the game as vocabulary practice for the missions.
export async function finishMemoryGame({ uid, pairs, xp }) {
  let played = 0;
  try { played = parseInt((await AsyncStorage.getItem(keyFor(uid))) || "0", 10) || 0; } catch (e) {}
  const capped = played >= MAX_REWARDED_PER_DAY;

  let xpAwarded = 0;
  let leveledUp = false;
  let failed = false;
  if (!capped) {
    try {
      const r = await awardXp(uid, xp);
      xpAwarded = xp;
      leveledUp = r.leveledUp;
      try { await AsyncStorage.setItem(keyFor(uid), String(played + 1)); } catch (e) {}
    } catch (e) {
      failed = true; // for example no internet: the game is not counted against the daily limit
    }
  }
  try { await recordActivity(uid, { type: "vocab", count: pairs }); } catch (e) {}

  return { xpAwarded, capped, leveledUp, failed };
}