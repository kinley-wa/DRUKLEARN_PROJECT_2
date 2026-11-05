import { MAX_HEARTS } from "@/constants/rewards";
import { useAuth } from "@/context/AuthContext";
import { getHearts, loseHeart as loseHeartRemote } from "@/services/heartService";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useHearts() {
  const { user, profile } = useAuth();
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [nextInMs, setNextInMs] = useState(0);
  // canPlay is decided only when a screen opens, so losing your last heart mid-quiz doesn't end it
  const [canPlay, setCanPlay] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const r = await getHearts(user.uid);
      setHearts(r.hearts); setNextInMs(r.nextInMs); setCanPlay(r.hearts > 0);
    } catch (e) {}
  }, [user]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const loseHeart = useCallback(async () => {
    if (!user) return;
    try {
      await loseHeartRemote(user.uid);
      const r = await getHearts(user.uid);
      setHearts(r.hearts); setNextInMs(r.nextInMs);
    } catch (e) {}
  }, [user]);

  return {
    enabled: !!profile && profile.role === "student",
    hearts, canPlay, loseHeart, refresh,
    minutesToNext: Math.max(1, Math.ceil(nextInMs / 60000)),
  };
}