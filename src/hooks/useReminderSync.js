import { useAuth } from "@/context/AuthContext";
import { syncReminders } from "@/services/notificationService";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export function useReminderSync() {
  const { profile } = useAuth();
  const isStudent = profile ? profile.role === "student" : false;
  useFocusEffect(useCallback(() => {
    if (isStudent) syncReminders().catch(() => {});
  }, [isStudent]));
}