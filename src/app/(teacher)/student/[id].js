import AppCard from "@/components/ui/AppCard";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { getAllLessons } from "@/services/lessonService";
import { getProgressForUser } from "@/services/progressService";
import { getAllQuizzes, getAttemptsForUser } from "@/services/quizService";
import { getUserProfile } from "@/services/userService";
import { getLevelInfo } from "@/utils/level";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StudentDetail() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    (async () => {
      const [p, l, q, pr, at] = await Promise.all([
        getUserProfile(id), getAllLessons(), getAllQuizzes(), getProgressForUser(id), getAttemptsForUser(id),
      ]);
      setStudent(p); setLessons(l); setQuizzes(q); setProgress(pr);
      setAttempts(at.sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Screen hasHeader><LoadingView /></Screen>;
  const done = progress.filter((p) => p.completed).length;
  const xp = student ? student.xp : 0;
  return (
    <Screen hasHeader>
      <Stack.Screen options={{ title: (student && student.fullName) || "Student" }} />
      <View style={s.stats}>
        <View style={s.stat}><Text style={s.sv}>{xp}</Text><Text style={s.sl}>XP</Text></View>
        <View style={s.stat}><Text style={s.sv}>{getLevelInfo(xp).level}</Text><Text style={s.sl}>Level</Text></View>
        <View style={s.stat}><Text style={s.sv}>{done}/{lessons.length}</Text><Text style={s.sl}>Lessons</Text></View>
        <View style={s.stat}><Text style={s.sv}>{student ? student.streak : 0}</Text><Text style={s.sl}>Streak</Text></View>
      </View>

      <Text style={s.h}>Lesson completion</Text>
      {lessons.map((l) => {
        const p = progress.find((x) => x.lessonId === l.id);
        const ok = !!(p && p.completed);
        return (
          <View key={l.id} style={s.row}>
            <Ionicons name={ok ? "checkmark-circle" : "ellipse-outline"} size={22} color={ok ? colors.success : colors.textSecondary} />
            <Text style={s.lt}>{l.title}</Text>
            <Text style={s.lp}>{p ? p.percent : 0}%</Text>
          </View>
        );
      })}

      <Text style={s.h}>Quiz attempts</Text>
      {attempts.length === 0 ? <Text style={s.lp}>No quiz attempts yet.</Text> : attempts.map((a) => {
        const quiz = quizzes.find((q) => q.id === a.quizId);
        return (
          <AppCard key={a.id}>
            <View style={s.rowB}>
              <Text style={s.lt}>{quiz ? quiz.title : "Quiz"}</Text>
              <Text style={s.score}>{a.score}/{a.total}  (+{a.xpEarned ?? a.pointsEarned ?? 0} XP)</Text>
            </View>
          </AppCard>
        );
      })}
    </Screen>
  );
}
const s = StyleSheet.create({
  stats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  stat: { alignItems: "center" },
  sv: { fontSize: 20, fontWeight: "800", color: colors.text },
  sl: { color: colors.textSecondary, fontSize: 12 },
  h: { fontSize: 17, fontWeight: "800", color: colors.text, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  rowB: { flexDirection: "row", justifyContent: "space-between" },
  lt: { flex: 1, color: colors.text, fontWeight: "600" },
  lp: { color: colors.textSecondary },
  score: { color: colors.goldDark, fontWeight: "700" },
});