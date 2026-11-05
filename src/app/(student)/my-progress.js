import AppCard from "@/components/ui/AppCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useStudentData } from "@/hooks/useStudentData";
import { StyleSheet, Text, View } from "react-native";

export default function MyProgress() {
  const { loading, lessons, progressMap } = useStudentData();
  if (loading && !lessons.length) return <Screen hasHeader><LoadingView /></Screen>;
  if (!lessons.length) return <Screen hasHeader><EmptyState title="No lessons yet" /></Screen>;
  const done = lessons.filter((l) => progressMap[l.id] && progressMap[l.id].completed).length;
  return (
    <Screen hasHeader>
      <Text style={s.sub}>{done} of {lessons.length} lessons completed</Text>
      {lessons.map((l) => {
        const pct = progressMap[l.id] ? progressMap[l.id].percent : 0;
        return (
          <AppCard key={l.id}>
            <View style={s.row}><Text style={s.t}>{l.title}</Text><Text style={s.p}>{pct}%</Text></View>
            <ProgressBar value={pct / 100} color={colors.success} />
          </AppCard>
        );
      })}
    </Screen>
  );
}
const s = StyleSheet.create({
  sub: { color: colors.textSecondary, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  t: { fontWeight: "700", color: colors.text, flex: 1 },
  p: { color: colors.textSecondary, fontWeight: "700" },
});