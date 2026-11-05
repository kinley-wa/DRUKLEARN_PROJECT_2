import AppCard from "@/components/ui/AppCard";
import Screen from "@/components/ui/Screen";
import { BADGES } from "@/constants/badges";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function Achievements() {
  const { profile } = useAuth();
  const earned = new Set(profile ? profile.badges : []);
  return (
    <Screen hasHeader>
      <Text style={s.sub}>{earned.size} of {BADGES.length} badges earned</Text>
      {BADGES.map((b) => {
        const on = earned.has(b.id);
        return (
          <AppCard key={b.id} style={{ opacity: on ? 1 : 0.55 }}>
            <View style={s.row}>
              <View style={[s.ic, { backgroundColor: (on ? b.color : colors.textSecondary) + "26" }]}>
                <Ionicons name={on ? b.icon : "lock-closed"} size={24} color={on ? b.color : colors.textSecondary} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.t}>{b.title}</Text>
                <Text style={s.d}>{b.description}</Text>
              </View>
              {on ? <Ionicons name="checkmark-circle" size={22} color={colors.success} /> : null}
            </View>
          </AppCard>
        );
      })}
    </Screen>
  );
}
const s = StyleSheet.create({
  sub: { color: colors.textSecondary, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  ic: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  t: { fontSize: 16, fontWeight: "700", color: colors.text },
  d: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});