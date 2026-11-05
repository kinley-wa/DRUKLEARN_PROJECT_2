import { db } from "@/config/firebase";
import { weekStartString } from "@/utils/date";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { normalizeProfile } from "./userService";

export async function getLeaderboard(period) {
  const field = period === "all" ? "xp" : "weeklyXp";
  const snap = await getDocs(query(collection(db, "users"), orderBy(field, "desc"), limit(100)));
  let list = snap.docs.map((d) => normalizeProfile(d.id, d.data())).filter((u) => u.role === "student");
  if (period === "week") {
    const week = weekStartString();
    list = list.filter((u) => u.weekStart === week && u.weeklyXp > 0);
  }
  return list.slice(0, 50);
}