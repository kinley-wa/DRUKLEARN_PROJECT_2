import AppCard from "@/components/ui/AppCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { getAllQuizzes } from "@/services/quizService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

function Shortcut({ icon, color, title, sub, onPress }) {
  return (
    <AppCard onPress={onPress}>
      <View style={s.row}>
        <View style={[s.ic, { backgroundColor: color + "26" }]}><Ionicons name={icon} size={24} color={color} /></View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={s.t}>{title}</Text>
          <Text style={s.sub}>{sub}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </AppCard>
  );
}

export default function Practice() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { setQuizzes(await getAllQuizzes()); } catch (e) { setError(true); } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen title="Practice" onRefresh={load} refreshing={loading}>
      <Shortcut icon="refresh-circle" color={colors.purple} title="Personalized Review" sub="Extra practice on your weak topics" onPress={() => router.push("/review")} />
      <Shortcut icon="trophy" color={colors.gold} title="Weekly Challenge" sub="Compete with other students" onPress={() => router.push("/competition")} />
      <Shortcut icon="albums" color={colors.teal} title="Memory Game" sub="Match Dzongkha words with meanings" onPress={() => router.push("/memory-game")} />
      <Text style={s.h}>Quizzes</Text>
      {loading && !quizzes.length ? <LoadingView /> : error ? <ErrorState onRetry={load} /> :
        quizzes.length === 0 ? <EmptyState icon="help-circle-outline" title="No quizzes yet" message="Check back soon." /> :
        quizzes.map((q) => (
          <AppCard key={q.id} onPress={() => router.push(`/quiz/${q.id}`)}>
            <View style={s.row}>
              <View style={[s.ic, { backgroundColor: colors.blue + "26" }]}><Ionicons name="help-circle" size={24} color={colors.blue} /></View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.t}>{q.title || "Untitled Quiz"}</Text>
                {q.lessonTitle ? <Text style={s.sub}>{q.lessonTitle}</Text> : null}
                <Text style={s.sub}>{q.questions.length} questions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </AppCard>
        ))}
    </Screen>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 18, fontWeight: "800", color: colors.text, marginVertical: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  ic: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  t: { fontSize: 16, fontWeight: "700", color: colors.text },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});