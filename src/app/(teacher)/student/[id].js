import TeacherScreen from "@/components/teacher/TeacherScreen";
import AppCard from "@/components/ui/AppCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import ProgressBar from "@/components/ui/ProgressBar";
import { BADGES } from "@/constants/badges";
import { colors } from "@/constants/theme";
import { getAllLessons } from "@/services/lessonService";
import { getProgressForUser } from "@/services/progressService";
import { getAllQuizzes, getAttemptsForUser } from "@/services/quizService";
import { getStudentTopicStats, lastActiveLabel, pctColor } from "@/services/teacherService";
import { getUserProfile } from "@/services/userService";
import { getLevelInfo } from "@/utils/level";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
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
  const [topics, setTopics] = useState(null);
  const [topicsBlocked, setTopicsBlocked] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, l, q, pr, at] = await Promise.all([
        getUserProfile(id), getAllLessons(), getAllQuizzes(), getProgressForUser(id), getAttemptsForUser(id),
      ]);
      setStudent(p); setLessons(l); setQuizzes(q); setProgress(pr);
      setAttempts(at.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      try { setTopics(await getStudentTopicStats(id)); } catch (e) { setTopicsBlocked(true); }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <TeacherScreen title="Student" hasHeader><LoadingView /></TeacherScreen>;
  if (!student) return <TeacherScreen title="Student" hasHeader><EmptyState title="Student not found" /></TeacherScreen>;

  const lessonIds = new Set(lessons.map((l) => l.id));
  const done = progress.filter((p) => p.completed && lessonIds.has(p.lessonId)).length;
  const earned = BADGES.filter((b) => student.badges.includes(b.id));

  return (
    <TeacherScreen
      title={student.fullName || "Student"} hasHeader
      subtitle={`${student.email} • opened the app ${lastActiveLabel(student.lastActiveDate).toLowerCase()}`}
      stats={[
        { icon: "star", value: student.xp, label: "XP", color: colors.gold },
        { icon: "trending-up", value: getLevelInfo(student.xp).level, label: "Level", color: colors.purple },
        { icon: "flame", value: student.streak, label: "Streak", color: colors.rose },
        { icon: "book", value: `${done}/${lessons.length}`, label: "Lessons", color: colors.green },
      ]}
    >
      <Text style={s.h}>Topic accuracy</Text>
      {topicsBlocked ? (
        <Text style={s.note}>Publish the updated Firestore rules (topicStats) to see topic accuracy here.</Text>
      ) : !topics || topics.length === 0 ? (
        <Text style={s.note}>No quiz or review data yet.</Text>
      ) : topics.map((t) => {
        const weak = t.total >= 3 && t.accuracy < 0.7 && t.category !== "Vocabulary";
        const pct = Math.round(t.accuracy * 100);
        return (
          <AppCard key={t.category}>
            <View style={s.rowB}>
              <Text style={s.name}>{t.category}</Text>
              {weak ? <View style={s.weak}><Text style={s.weakText}>Needs practice</Text></View> : null}
            </View>
            <View style={{ marginVertical: 8 }}><ProgressBar value={t.accuracy} color={pctColor(pct)} height={8} /></View>
            <Text style={s.note}>{pct}% correct ({t.correct} of {t.total} answers)</Text>
          </AppCard>
        );
      })}

      <Text style={[s.h, { marginTop: 14 }]}>Lessons</Text>
      {lessons.length === 0 ? <Text style={s.note}>No lessons yet.</Text> : lessons.map((l) => {
        const p = progress.find((x) => x.lessonId === l.id);
        const ok = !!(p && p.completed);
        const pct = p ? p.percent : 0;
        return (
          <View key={l.id} style={s.lessonRow}>
            <Ionicons name={ok ? "checkmark-circle" : "ellipse-outline"} size={22} color={ok ? colors.success : colors.textSecondary} />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={s.name} numberOfLines={1}>{l.title}</Text>
              <View style={{ marginTop: 5 }}><ProgressBar value={pct / 100} color={colors.success} height={5} /></View>
            </View>
            <Text style={s.note}>{pct}%</Text>
          </View>
        );
      })}

      <Text style={[s.h, { marginTop: 14 }]}>Quiz attempts</Text>
      {attempts.length === 0 ? <Text style={s.note}>No quiz attempts yet.</Text> : attempts.map((a) => {
        const quiz = quizzes.find((x) => x.id === a.quizId);
        const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
        return (
          <AppCard key={a.id}>
            <View style={s.rowB}>
              <View style={{ flex: 1 }}>
                <Text style={s.name} numberOfLines={1}>{quiz ? quiz.title : "Quiz"}</Text>
                <Text style={s.note}>{a.timestamp ? new Date(a.timestamp).toLocaleDateString() : ""} • +{a.xpEarned ?? a.pointsEarned ?? 0} XP</Text>
              </View>
              <View style={[s.pill, { backgroundColor: pctColor(pct) + "22" }]}>
                <Text style={[s.pillText, { color: pctColor(pct) }]}>{a.score}/{a.total} • {pct}%</Text>
              </View>
            </View>
          </AppCard>
        );
      })}

      <Text style={[s.h, { marginTop: 14 }]}>Badges ({earned.length}/{BADGES.length})</Text>
      {earned.length === 0 ? <Text style={s.note}>No badges earned yet.</Text> : (
        <View style={s.badges}>
          {earned.map((b) => (
            <View key={b.id} style={[s.badge, { backgroundColor: b.color + "22" }]}>
              <Ionicons name={b.icon} size={18} color={b.color} />
              <Text style={[s.badgeText, { color: b.color }]}>{b.title}</Text>
            </View>
          ))}
        </View>
      )}
    </TeacherScreen>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 10 },
  note: { color: colors.textSecondary, fontSize: 12 },
  name: { fontWeight: "700", color: colors.text },
  rowB: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  weak: { backgroundColor: colors.error + "22", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  weakText: { color: colors.error, fontWeight: "800", fontSize: 11 },
  lessonRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontWeight: "800", fontSize: 12 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  badgeText: { fontWeight: "800", fontSize: 12 },
});