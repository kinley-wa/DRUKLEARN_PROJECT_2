import TeacherScreen from "@/components/teacher/TeacherScreen";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import ProgressBar from "@/components/ui/ProgressBar";
import { colors } from "@/constants/theme";
import { getQuiz } from "@/services/quizService";
import { getQuizStats, pctColor } from "@/services/teacherService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function QuizStats() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const q = await getQuiz(id);
      setQuiz(q);
      if (q) setStats(await getQuizStats(q));
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <TeacherScreen title="Quiz Results" hasHeader><LoadingView /></TeacherScreen>;
  if (!quiz || !stats) return <TeacherScreen title="Quiz Results" hasHeader><EmptyState title="Quiz not found" /></TeacherScreen>;

  return (
    <TeacherScreen
      title={quiz.title || "Quiz"} hasHeader
      subtitle={`${quiz.questions.length} questions • code ${quiz.accessCode || "none"}`}
      stats={[
        { icon: "repeat", value: stats.attempts.length, label: "Attempts", color: colors.gold },
        { icon: "people", value: stats.students, label: "Students", color: colors.blue },
        { icon: "analytics", value: `${stats.avg}%`, label: "Average", color: colors.green },
        { icon: "ribbon", value: `${stats.best}%`, label: "Best", color: colors.pink },
      ]}
    >
      <AppButton title="Edit this quiz" variant="ghost" icon="pencil" onPress={() => router.push({ pathname: "/quiz-form", params: { id: quiz.id } })} style={{ marginBottom: 16 }} />

      {stats.attempts.length === 0 ? (
        <EmptyState icon="stats-chart-outline" title="No attempts yet" message="Results appear here once students take this quiz." />
      ) : (
        <>
          <Text style={s.h}>Hardest questions</Text>
          {stats.hardest.length === 0 ? (
            <Text style={s.note}>Question-level results appear for attempts made in the new app. Older attempts only have a total score.</Text>
          ) : stats.hardest.map((h) => (
            <AppCard key={h.question.id}>
              <Text style={s.q} numberOfLines={3}>{h.question.text}</Text>
              <View style={{ marginVertical: 8 }}>
                <ProgressBar value={h.rate} color={colors.error} height={8} />
              </View>
              <Text style={s.note}>{Math.round(h.rate * 100)}% got this wrong ({h.wrong} of {h.total} answers)</Text>
            </AppCard>
          ))}

          <Text style={[s.h, { marginTop: 14 }]}>Recent attempts</Text>
          {stats.attempts.slice(0, 15).map((a) => {
            const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
            return (
              <AppCard key={a.id}>
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{a.userName || "Student"}</Text>
                    <Text style={s.note}>{a.timestamp ? new Date(a.timestamp).toLocaleDateString() : ""}</Text>
                  </View>
                  <View style={[s.pill, { backgroundColor: pctColor(pct) + "22" }]}>
                    <Text style={[s.pillText, { color: pctColor(pct) }]}>{a.score}/{a.total} • {pct}%</Text>
                  </View>
                </View>
              </AppCard>
            );
          })}
        </>
      )}
    </TeacherScreen>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 10 },
  q: { fontWeight: "700", color: colors.text },
  note: { color: colors.textSecondary, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  name: { fontWeight: "700", color: colors.text },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontWeight: "800", fontSize: 12 },
});