import CategoryIcon from "@/components/learning/CategoryIcon";
import HeartsBar from "@/components/learning/HeartsBar";
import MissionsSummaryCard from "@/components/learning/MissionsSummaryCard";
import StreakChip from "@/components/learning/StreakChip";
import WeakTopicCard from "@/components/learning/WeakTopicCard";
import WordOfTheDayCard from "@/components/learning/WordOfTheDayCard";
import XpBar from "@/components/learning/XpBar";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import ErrorState from "@/components/ui/ErrorState";
import LoadingView from "@/components/ui/LoadingView";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useHearts } from "@/hooks/useHearts";
import { useReminderSync } from "@/hooks/useReminderSync";
import { useStudentData } from "@/hooks/useStudentData";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const { loading, error, lessons, progressMap, reload } = useStudentData();
  const hearts = useHearts();
  useReminderSync();
  useFocusEffect(useCallback(() => { refreshProfile(); }, [refreshProfile]));

  if (loading && !lessons.length) return <Screen><LoadingView /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;

  const streak = profile?.streak ?? 0;
  const streakColor = streak >= 14 ? "#FF6B5B" : streak >= 1 ? colors.gold : colors.textSecondary;
  const next = lessons.find((l) => !progressMap[l.id]?.completed);
  const nextProgress = next ? progressMap[next.id] : undefined;

  const quick = [
    { icon: "book", label: "Lessons", color: colors.gold, go: "/lessons" },
    { icon: "brush", label: "Calligraphy", color: colors.green, go: "/calligraphy" },
    { icon: "language", label: "Vocabulary", color: colors.pink, go: "/vocabulary" },
    { icon: "trophy", label: "Challenge", color: colors.purple, go: "/competition" },
  ];

  return (
    <Screen>
      <Text style={s.hello}>Kuzu zangpo, {(profile?.fullName || "Learner").split(" ")[0]}! 👋</Text>
      <Text style={s.sub}>Keep learning every day.</Text>

      <View style={s.chips}>
        <StreakChip icon="flame" text={`${streak} Day Streak`} tint={streakColor} />
        <StreakChip icon="star" text={`${profile?.xp ?? 0} XP`} tint={colors.goldDark} />
      </View>

      {hearts.enabled ? <HeartsBar hearts={hearts.hearts} /> : null}
      <XpBar xp={profile?.xp ?? 0} />
      <MissionsSummaryCard />
      <WordOfTheDayCard />

      <Text style={s.h2}>Continue Learning</Text>
      {next ? (
        <AppCard onPress={() => router.push(`/lesson/${next.id}`)}>
          <View style={s.row}>
            <CategoryIcon category={next.category} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.lessonTitle}>{next.title || "Untitled Lesson"}</Text>
              <Text style={s.small}>Section {(nextProgress?.sectionsCompleted ?? 0) + 1} of {next.sections.length}</Text>
            </View>
          </View>
          <View style={{ marginVertical: 12 }}>
            <ProgressBar value={(nextProgress?.percent ?? 0) / 100} color={colors.success} />
          </View>
          <AppButton title="Continue" onPress={() => router.push(`/lesson/${next.id}`)} />
        </AppCard>
      ) : (
        <AppCard>
          <Text style={s.small}>
            {lessons.length ? "All lessons complete, great job! 🎉" : "No lessons yet. Ask your teacher to add some."}
          </Text>
        </AppCard>
      )}

      <WeakTopicCard />

      <Text style={s.h2}>Quick Access</Text>
      <View style={s.grid}>
        {quick.map((q) => (
          <AppCard key={q.label} onPress={() => router.push(q.go)} style={s.tile}>
            <View style={[s.tileIcon, { backgroundColor: q.color + "26" }]}>
              <Ionicons name={q.icon} size={26} color={q.color} />
            </View>
            <Text style={s.tileLabel}>{q.label}</Text>
          </AppCard>
        ))}
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  hello: { fontSize: 24, fontWeight: "800", color: colors.text },
  sub: { color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  chips: { flexDirection: "row", gap: 12, marginBottom: 12 },
  h2: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 12, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  lessonTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  small: { color: colors.textSecondary, fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47.5%", alignItems: "center", marginBottom: 0 },
  tileIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  tileLabel: { fontWeight: "700", color: colors.text },
});