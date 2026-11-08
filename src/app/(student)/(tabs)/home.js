import CategoryIcon from "@/components/learning/CategoryIcon";
import MissionsSummaryCard from "@/components/learning/MissionsSummaryCard";
import WeakTopicCard from "@/components/learning/WeakTopicCard";
import WordOfTheDayCard from "@/components/learning/WordOfTheDayCard";
import AppCard from "@/components/ui/AppCard";
import ErrorState from "@/components/ui/ErrorState";
import LoadingView from "@/components/ui/LoadingView";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen from "@/components/ui/Screen";
import { MAX_HEARTS } from "@/constants/rewards";
import { colors, radius, shadow } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useHearts } from "@/hooks/useHearts";
import { useReminderSync } from "@/hooks/useReminderSync";
import { useStudentData } from "@/hooks/useStudentData";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const LEVEL_XP = 200; // change if your XpBar uses a different level size

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
  const xp = profile?.xp ?? 0;
  const level = Math.floor(xp / LEVEL_XP) + 1;
  const into = xp % LEVEL_XP;
  const next = lessons.find((l) => !progressMap[l.id]?.completed);
  const nextProgress = next ? progressMap[next.id] : undefined;
  const firstName = (profile?.fullName || "Learner").split(" ")[0];

  const quick = [
    { icon: "book", label: "Lessons", color: colors.gold, go: "/lessons" },
    { icon: "brush", label: "Calligraphy", color: colors.green, go: "/calligraphy" },
    { icon: "language", label: "Vocabulary", color: colors.pink, go: "/vocabulary" },
    { icon: "trophy", label: "Challenge", color: colors.purple, go: "/competition" },
    { icon: "albums", label: "Memory Game", color: colors.teal, go: "/memory-game" },
  ];

  return (
    <Screen>
      {/* HERO: greeting + streak + XP + hearts + level in ONE card */}
      <View style={s.hero}>
        <Text style={s.hello}>Kuzu zangpo,</Text>
        <Text style={s.name}>{firstName} 👋</Text>

        <View style={s.statRow}>
          <View style={s.pill}>
            <Ionicons name="flame" size={16} color={colors.gold} />
            <Text style={s.pillText}>{streak} day{streak === 1 ? "" : "s"}</Text>
          </View>
          <View style={s.pill}>
            <Ionicons name="star" size={16} color={colors.gold} />
            <Text style={s.pillText}>{xp} XP</Text>
          </View>
          {hearts.enabled ? (
            <View style={[s.pill, { marginLeft: "auto", gap: 3 }]}>
              {Array.from({ length: MAX_HEARTS }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < hearts.hearts ? "heart" : "heart-outline"}
                  size={15}
                  color={i < hearts.hearts ? colors.rose : "rgba(255,255,255,0.4)"}
                />
              ))}
            </View>
          ) : null}
        </View>
        {hearts.enabled && hearts.hearts < MAX_HEARTS ? (
          <Text style={s.regen}>Next heart in ~{hearts.minutesToNext} min</Text>
        ) : null}

        <View style={s.levelRow}>
          <Text style={s.levelText}>Level {level}</Text>
          <Text style={s.levelXp}>{into} / {LEVEL_XP} XP</Text>
        </View>
        <View style={s.track}>
          <View style={[s.fill, { width: `${(into / LEVEL_XP) * 100}%` }]} />
        </View>
      </View>

      <View style={s.gap}><MissionsSummaryCard /></View>
      <View style={s.gap}><WordOfTheDayCard /></View>

      {/* CONTINUE LEARNING: slim row with a play button */}
      <Text style={s.h2}>Continue learning</Text>
      {next ? (
        <Pressable style={s.continueCard} onPress={() => router.push(`/lesson/${next.id}`)}>
          <CategoryIcon category={next.category} />
          <View style={{ flex: 1, marginHorizontal: 14 }}>
            <Text style={s.lessonTitle} numberOfLines={1}>{next.title || "Untitled Lesson"}</Text>
            <Text style={s.small}>
              Section {(nextProgress?.sectionsCompleted ?? 0) + 1} of {next.sections.length}
            </Text>
            <View style={{ marginTop: 8 }}>
              <ProgressBar value={(nextProgress?.percent ?? 0) / 100} color={colors.gold} />
            </View>
          </View>
          <View style={s.play}>
            <Ionicons name="play" size={20} color={colors.navy} />
          </View>
        </Pressable>
      ) : (
        <AppCard>
          <Text style={s.small}>
            {lessons.length ? "All lessons complete, great job! 🎉" : "No lessons yet. Ask your teacher to add some."}
          </Text>
        </AppCard>
      )}

      <WeakTopicCard />

      {/* QUICK ACCESS: one row of 4 */}
      <Text style={s.h2}>Quick access</Text>
      <View style={s.quickRow}>
        {quick.map((q) => (
          <Pressable key={q.label} style={s.tile} onPress={() => router.push(q.go)}>
            <View style={[s.tileIcon, { backgroundColor: q.color + "22" }]}>
              <Ionicons name={q.icon} size={22} color={q.color} />
            </View>
            <Text style={s.tileLabel} numberOfLines={1}>{q.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: colors.navy, borderRadius: 28, padding: 18, ...shadow },
  hello: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "500" },
  name: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 2 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: colors.navyLight, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 14,
  },
  pillText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  regen: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 6, textAlign: "right" },
  levelRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, marginBottom: 6 },
  levelText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  levelXp: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  track: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.18)", overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.gold },

  gap: { marginTop: 12 },
  h2: { fontSize: 17, fontWeight: "800", color: colors.text, marginTop: 20, marginBottom: 10 },

  continueCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: 14, ...shadow,
  },
  lessonTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  small: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  play: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: colors.gold,
    alignItems: "center", justifyContent: "center",
  },

  quickRow: { flexDirection: "row", gap: 10 },
  tile: {
    flex: 1, alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.lg, paddingVertical: 14, ...shadow,
  },
  tileIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  tileLabel: { fontWeight: "700", color: colors.text, fontSize: 11 },
});