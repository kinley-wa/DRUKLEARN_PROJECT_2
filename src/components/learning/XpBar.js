import AppCard from "@/components/ui/AppCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { colors } from "@/constants/theme";
import { getLevelInfo } from "@/utils/level";
import { StyleSheet, Text, View } from "react-native";

export default function XpBar({ xp }) {
  const info = getLevelInfo(xp);
  return (
    <AppCard>
      <View style={s.row}>
        <Text style={s.level}>Level {info.level}</Text>
        <Text style={s.xp}>{info.xpIntoLevel} / {info.xpForNext} XP</Text>
      </View>
      <ProgressBar value={info.progress} height={10} />
      <Text style={s.total}>{xp} XP total</Text>
    </AppCard>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  level: { fontSize: 16, fontWeight: "800", color: colors.text },
  xp: { color: colors.textSecondary, fontWeight: "600" },
  total: { color: colors.textSecondary, fontSize: 12, marginTop: 6 },
});