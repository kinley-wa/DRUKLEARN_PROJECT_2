import { colors } from "@/constants/theme";
import { View } from "react-native";

export default function ProgressBar({ value, color = colors.gold, height = 8 }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: colors.border, overflow: "hidden" }}>
      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color }} />
    </View>
  );
}