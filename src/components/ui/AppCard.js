import { colors, radius, shadow } from "@/constants/theme";
import { Pressable, StyleSheet, View } from "react-native";

export default function AppCard({ children, onPress, style }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.88 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}
const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 12, ...shadow },
});