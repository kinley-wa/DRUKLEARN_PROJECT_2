import AppCard from "@/components/ui/AppCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getTodayMissions } from "@/services/missionService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MissionsSummaryCard() {
  const router = useRouter();
  const { user } = useAuth();
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    getTodayMissions(user.uid).then(({ data, defs }) => {
      setTotal(defs.length);
      setDone(defs.filter((m) => data.claimed[m.id]).length);
    }).catch(() => {});
  }, [user]));

  if (!total) return null;
  return (
    <AppCard onPress={() => router.push("/missions")}>
      <View style={s.row}>
        <Ionicons name="flag" size={22} color={colors.gold} />
        <Text style={s.t}>Today's Missions</Text>
        <Text style={s.c}>{done}/{total}</Text>
      </View>
      <View style={{ marginTop: 10 }}><ProgressBar value={done / total} /></View>
    </AppCard>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  t: { flex: 1, fontWeight: "800", color: colors.text, fontSize: 15 },
  c: { color: colors.textSecondary, fontWeight: "700" },
});