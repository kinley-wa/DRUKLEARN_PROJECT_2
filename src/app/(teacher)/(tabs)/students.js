import AppCard from "@/components/ui/AppCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { getAllStudents } from "@/services/userService";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Students() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { setStudents(await getAllStudents()); } catch (e) { setError(true); } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const active = students.filter((x) => x.xp > 0).length;
  return (
    <Screen title="Student Progress" onRefresh={load} refreshing={loading}>
      <View style={s.stats}>
        <View style={s.stat}><Text style={s.sv}>{students.length}</Text><Text style={s.sl}>Registered</Text></View>
        <View style={s.stat}><Text style={[s.sv, { color: colors.success }]}>{active}</Text><Text style={s.sl}>Active</Text></View>
        <View style={s.stat}><Text style={[s.sv, { color: colors.pink }]}>{students.length - active}</Text><Text style={s.sl}>Not Started</Text></View>
      </View>
      {loading && !students.length ? <LoadingView /> : error ? <ErrorState onRetry={load} /> :
        students.length === 0 ? (
          <EmptyState icon="people-outline" title="No students yet" message="Students appear here after they register." />
        ) : students.map((u) => (
          <AppCard key={u.uid} onPress={() => router.push(`/student/${u.uid}`)}>
            <View style={s.row}>
              <View style={[s.avatar, u.xp === 0 && { backgroundColor: "#BFC3CC" }]}>
                <Text style={s.av}>{(u.fullName || "?").slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={s.n}>{u.fullName || "Unnamed"}</Text>
                <Text style={s.e}>{u.email}</Text>
              </View>
              {u.xp > 0 ? (
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.xp}>{u.xp} XP</Text>
                  <Text style={s.e}>🔥 {u.streak}d</Text>
                </View>
              ) : <Text style={s.none}>Not started</Text>}
            </View>
          </AppCard>
        ))}
    </Screen>
  );
}
const s = StyleSheet.create({
  stats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  stat: { alignItems: "center" },
  sv: { fontSize: 24, fontWeight: "800", color: colors.text },
  sl: { color: colors.textSecondary, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center" },
  av: { color: "#fff", fontWeight: "800" },
  n: { fontWeight: "700", color: colors.text },
  e: { color: colors.textSecondary, fontSize: 12 },
  xp: { fontWeight: "800", color: colors.goldDark },
  none: { color: colors.textSecondary, fontSize: 12 },
});