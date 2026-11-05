import { db } from "@/config/firebase";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";

export async function awardBadge(uid, badgeId) {
  try {
    await updateDoc(doc(db, "users", uid), { badges: arrayUnion(badgeId) });
  } catch (e) {
    // non-critical, ignore
  }
}