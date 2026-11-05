import AppCard from "@/components/ui/AppCard";
import { MAX_HEARTS } from "@/constants/rewards";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function HeartsBar({ hearts, minutesToNext }) {
  return (
    <AppCard>
      <View style={s.row}>
        <View style={s.hearts}>
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Ionicons key={i} name={i < hearts ? "heart" : "heart-outline"} size={24} color={i < hearts ? colors.rose : colors.textSecondary} />
          ))}
        </View>
        <Text style={s.t}>
          {hearts >= MAX_HEARTS ? "Full hearts" : minutesToNext ? `Next heart in ~${minutesToNext} min` : `${hearts}/${MAX_HEARTS} hearts`}
        </Text>
      </View>
    </AppCard>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hearts: { flexDirection: "row", gap: 4 },
  t: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
});