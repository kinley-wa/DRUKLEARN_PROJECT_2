import AnimatedSplash from "@/components/ui/AnimatedSplash";
import { ONBOARDED_KEY } from "@/constants/storage";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

const MIN_MS = 3000; // keep the intro on screen long enough to play fully

export default function Index() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [minDone, setMinDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), MIN_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!minDone || loading) return;
    if (user) {
      if (!profile) return;
      router.replace(profile.role === "teacher" ? "/dashboard" : "/home");
      return;
    }
    AsyncStorage.getItem(ONBOARDED_KEY).then((v) => router.replace(v ? "/login" : "/onboarding"));
  }, [minDone, loading, user, profile]);

  return <AnimatedSplash />;
}