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
      if (group !== "(auth)" && group !== undefined) router.replace("/login");
      return; // app/index.js decides onboarding vs login
    }
    if (!profile) return;
    const isTeacher = profile.role === "teacher";
    const wrongArea = (isTeacher && group === "(student)") || (!isTeacher && group === "(teacher)");
    if (group === "(auth)" || group === undefined || wrongArea) {
      router.replace(isTeacher ? "/dashboard" : "/home");
    }
  }, [navState?.key, user, profile, loading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Gate />
    </AuthProvider>
  );
}