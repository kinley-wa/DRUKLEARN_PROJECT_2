import { colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text } from "react-native";

export default function Chip({ label, selected, onPress, color = colors.gold }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, selected && { backgroundColor: color + "33", borderColor: color }]}>
      <Text style={{ color: selected ? color : colors.textSecondary, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
});