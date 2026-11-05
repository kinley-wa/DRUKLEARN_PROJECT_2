import AppCard from "@/components/ui/AppCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function MissionCard({ mission, progress, done }) {
  const shown = Math.min(progress, mission.target);
  return (
    <AppCard>
      <View style={s.row}>
        <Ionicons name={done ? "checkmark-circle" : "flag"} size={26} color={done ? colors.success : colors.gold} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.t}>{mission.title}</Text>
          <View style={{ marginTop: 8 }}>
            <ProgressBar value={shown / mission.target} color={done ? colors.success : colors.gold} />
          </View>
          <Text style={s.sub}>{shown}/{mission.target}</Text>
        </View>
        <Text style={s.xp}>+{mission.xp} XP</Text>
      </View>
    </AppCard>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  t: { fontWeight: "700", color: colors.text },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  xp: { color: colors.goldDark, fontWeight: "800", marginLeft: 8 },
});