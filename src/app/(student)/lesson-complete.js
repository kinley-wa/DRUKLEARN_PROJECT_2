import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function LessonComplete() {
  const { xp, title, leveledUp } = useLocalSearchParams();
  const router = useRouter();
  return (
    <Screen hasHeader>
      <View style={s.c}>
        <View style={s.badge}><Ionicons name="trophy" size={56} color={colors.goldDark} /></View>
        <Text style={s.h}>Lesson Complete!</Text>
        <Text style={s.sub}>{title}</Text>
        <Text style={s.xp}>{Number(xp) > 0 ? `+${xp} XP` : "Already completed. No new XP."}</Text>
        {leveledUp === "1" ? <Text style={s.level}>🎉 Level up!</Text> : null}
      </View>
      <AppButton title="Take a Quiz" onPress={() => router.replace("/practice")} />
      <View style={{ height: 10 }} />
      <AppButton title="Back to Lessons" variant="ghost" onPress={() => router.replace("/lessons")} />
    </Screen>
  );
}
const s = StyleSheet.create({
  c: { alignItems: "center", paddingVertical: 40 },
  badge: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.gold + "33", alignItems: "center", justifyContent: "center" },
  h: { fontSize: 26, fontWeight: "800", color: colors.text, marginTop: 18 },
  sub: { color: colors.textSecondary, marginTop: 4 },
  xp: { fontSize: 22, fontWeight: "800", color: colors.success, marginTop: 18 },
  level: { fontSize: 18, fontWeight: "800", color: colors.purple, marginTop: 10 },
});