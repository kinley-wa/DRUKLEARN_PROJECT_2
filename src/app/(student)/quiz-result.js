import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function QuizResult() {
  const { score, total, xp, leveledUp } = useLocalSearchParams();
  const router = useRouter();
  const pct = Number(total) > 0 ? Math.round((Number(score) / Number(total)) * 100) : 0;
  const msg = pct >= 80 ? "Great Job! 😊" : pct >= 50 ? "Good Effort! 👍" : "Keep Practicing! 💪";
  return (
    <Screen hasHeader>
      <View style={s.c}>
        <View style={s.badge}><Ionicons name="trophy" size={52} color={colors.goldDark} /></View>
        <Text style={s.h}>{msg}</Text>
        <Text style={s.label}>YOUR SCORE</Text>
        <Text style={s.score}>{score} / {total}</Text>
        <Text style={s.xp}>+{xp} XP</Text>
        {leveledUp === "1" ? <Text style={s.level}>🎉 Level up!</Text> : null}
      </View>
      <AppButton title="Back to Home" onPress={() => router.replace("/home")} />
      <View style={{ height: 10 }} />
      <AppButton title="More Practice" variant="ghost" onPress={() => router.replace("/practice")} />
    </Screen>
  );
}
const s = StyleSheet.create({
  c: { alignItems: "center", paddingVertical: 36 },
  badge: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.gold + "33", alignItems: "center", justifyContent: "center" },
  h: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 16 },
  label: { color: colors.textSecondary, fontSize: 11, marginTop: 22, letterSpacing: 1 },
  score: { fontSize: 48, fontWeight: "900", color: colors.text },
  xp: { fontSize: 18, fontWeight: "800", color: colors.success },
  level: { fontSize: 18, fontWeight: "800", color: colors.purple, marginTop: 10 },
});