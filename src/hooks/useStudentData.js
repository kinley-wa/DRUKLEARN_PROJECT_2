import { useAuth } from "@/context/AuthContext";
import { getAllLessons } from "@/services/lessonService";
import { getProgressForUser } from "@/services/progressService";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useStudentData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessons, setLessons] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const [ls, progress] = await Promise.all([getAllLessons(), getProgressForUser(user.uid)]);
      const map = {};
      progress.forEach((p) => { map[p.lessonId] = p; });
      setLessons(ls); setProgressMap(map);
    } catch (e) {
      setError("Couldn't load your lessons.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // reloads every time the screen comes back into view
  useFocusEffect(useCallback(() => { reload(); }, [reload]));
  return { loading, error, lessons, progressMap, reload };
}