import AppCard from "@/components/ui/AppCard";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { awardBadge } from "@/services/badgeService";
import { getLeaderboard } from "@/services/leaderboardService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const MEDALS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const list = await getLeaderboard(p);
      setUsers(list);
      const rank = list.findIndex((u) => user && u.uid === user.uid);
      if (p === "all" && rank >= 0 && rank < 10 && user) awardBadge(user.uid, "top_10");
    } catch (e) {
      setUsers([]);
    } finally { setLoading(false); }
  }, [user]);
  useFocusEffect(useCallback(() => { load(period); }, [load, period]));

  const myRank = users.findIndex((u) => user && u.uid === user.uid) + 1;
  const pts = (u) => (period === "all" ? u.xp : u.weeklyXp);

  return (
    <Screen title="Leaderboard" onRefresh={() => load(period)} refreshing={loading}>
      <View style={s.chips}>
        <Chip label="All Time" selected={period === "all"} onPress={() => setPeriod("all")} />
        <Chip label="This Week" selected={period === "week"} onPress={() => setPeriod("week")} />
      </View>
      {myRank > 0 ? (
        <View style={s.me}>
          <Text style={s.meT}>YOUR RANK  #{myRank}</Text>
          <Text style={s.meX}>{pts(users[myRank - 1])} XP</Text>
        </View>
      ) : null}
      {loading && !users.length ? <LoadingView /> : users.length === 0 ? (
        <EmptyState icon="trophy-outline" title="No rankings yet" message="Earn XP to appear here." />
      ) : users.map((u, i) => {
        const isMe = user && u.uid === user.uid;
        return (
          <AppCard key={u.uid} style={isMe ? { borderWidth: 2, borderColor: colors.gold } : undefined}>
            <View style={s.row}>
              <View style={{ width: 34, alignItems: "center" }}>
                {i < 3 ? <Ionicons name="trophy" size={22} color={MEDALS[i]} /> : <Text style={s.rank}>{i + 1}</Text>}
              </View>
              <View style={s.avatar}><Text style={s.av}>{(u.fullName || "?").slice(0, 1).toUpperCase()}</Text></View>
              <Text style={[s.name, isMe && { fontWeight: "800" }]}>{isMe ? `${u.fullName} (You)` : u.fullName || "Learner"}</Text>
              <Text style={s.xp}>{pts(u)} XP</Text>
            </View>
          </AppCard>
        );
      })}
    </Screen>
  );
}
const s = StyleSheet.create({
  chips: { flexDirection: "row", gap: 8, marginBottom: 14 },
  me: { backgroundColor: colors.navy, borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  meT: { color: "#fff", fontWeight: "800" },
  meX: { color: colors.gold, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center" },
  rank: { fontWeight: "800", color: colors.textSecondary },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center", marginHorizontal: 10 },
  av: { color: "#fff", fontWeight: "800" },
  name: { flex: 1, color: colors.text, fontSize: 15 },
  xp: { color: colors.textSecondary, fontWeight: "700" },
});