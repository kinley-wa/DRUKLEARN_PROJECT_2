import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

function Gate() {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key || loading) return;
    const group = segments[0];
    if (!user) {
      // index.js (the animated intro) handles the first screen
      if (group !== "(auth)" && group !== undefined) router.replace("/login");
      return;
    }
    if (!profile) return;
    const isTeacher = profile.role === "teacher";
    const wrongArea = (isTeacher && group === "(student)") || (!isTeacher && group === "(teacher)");
    if (group === "(auth)" || wrongArea) {
      router.replace(isTeacher ? "/dashboard" : "/home");
    }
  }, [navState?.key, user, profile, loading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Gate />
    </AuthProvider>
  );
}