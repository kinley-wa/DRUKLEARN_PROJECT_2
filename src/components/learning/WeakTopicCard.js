import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getWeakTopics } from "@/services/topicStatsService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function WeakTopicCard() {
  const router = useRouter();
  const { user } = useAuth();
  const [weak, setWeak] = useState(null);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    getWeakTopics(user.uid).then((l) => setWeak(l[0] || null)).catch(() => {});
  }, [user]));

  if (!weak) return null;
  return (
    <AppCard>
      <View style={s.row}>
        <Ionicons name="bulb" size={24} color={colors.purple} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.t}>Needs practice: {weak.category}</Text>
          <Text style={s.sub}>You got {Math.round(weak.accuracy * 100)}% right in this topic.</Text>
        </View>
      </View>
      <View style={{ height: 12 }} />
      <AppButton title="Start Review" variant="secondary"
        onPress={() => router.push({ pathname: "/review", params: { category: weak.category } })} />
    </AppCard>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  t: { fontWeight: "800", color: colors.text },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});