import { LAST_LEARN_KEY } from "@/constants/storage";
import { toDateString } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addMissionProgress } from "./missionService";
import { recordTopicResults } from "./topicStatsService";

// event = { type: "lesson" | "quiz" | "vocab" | "review", correct?, count?, details? }
export async function recordActivity(uid, event) {
  try { await AsyncStorage.setItem(LAST_LEARN_KEY, toDateString()); } catch (e) {}
  try { await addMissionProgress(uid, event.type, event.correct || 0, event.count || 1); }
  catch (e) { console.warn("missions", e); }
  try { if (event.details && event.details.length) await recordTopicResults(uid, event.details); }
  catch (e) { console.warn("topic stats", e); }
}