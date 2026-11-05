import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function StreakChip({ icon, text, tint }) {
  return (
    <View style={[s.chip, { backgroundColor: tint + "26" }]}>
      <Ionicons name={icon} size={20} color={tint} />
      <Text style={s.text}>{text}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  chip: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 14 },
  text: { fontWeight: "700", color: colors.text },
});