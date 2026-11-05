import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getCompetition, getCompetitionLeaderboard } from "@/services/competitionService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CompetitionResult() {
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const c = await getCompetition();
      if (c) setList(await getCompetitionLeaderboard(c));
      setLoading(false);
    })();
  }, []);

  if (loading) return <Screen hasHeader><LoadingView /></Screen>;
  const rank = list.findIndex((a) => user && a.userId === user.uid) + 1;
  const mine = list.find((a) => user && a.userId === user.uid);
  return (
    <Screen hasHeader>
      <Text style={s.h}>Challenge Complete!</Text>
      {mine ? (
        <Text style={s.sub}>Rank #{rank} • {mine.score}/{mine.total} • +{mine.xpEarned} XP</Text>
      ) : <Text style={s.sub}>Top finishers this week</Text>}
      <Text style={s.t}>Top Finishers</Text>
      {list.map((a, i) => (
        <AppCard key={a.id}>
          <View style={s.row}>
            <Text style={s.rank}>{i + 1}</Text>
            <Text style={s.n}>{user && a.userId === user.uid ? "You" : a.userName || "Learner"}</Text>
            <Text style={s.sc}>{a.score}/{a.total}</Text>
          </View>
        </AppCard>
      ))}
      <AppButton title="Back to Home" onPress={() => router.replace("/home")} style={{ marginTop: 12 }} />
      <View style={{ height: 10 }} />
      <AppButton title="View Leaderboard" variant="ghost" onPress={() => router.replace("/leaderboard")} />
    </Screen>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" },
  sub: { color: colors.goldDark, fontWeight: "700", textAlign: "center", marginVertical: 8 },
  t: { fontSize: 17, fontWeight: "800", color: colors.text, marginVertical: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  rank: { width: 28, fontWeight: "800", color: colors.textSecondary },
  n: { flex: 1, color: colors.text, fontWeight: "600" },
  sc: { fontWeight: "800", color: colors.text },
});