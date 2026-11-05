import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

export default function AppButton({ title, onPress, variant = "primary", loading, disabled, icon, style }) {
  const bg = variant === "primary" ? colors.gold : variant === "danger" ? colors.error : variant === "secondary" ? colors.navy : "transparent";
  const fg = variant === "primary" || variant === "ghost" ? colors.navy : "#fff";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === "ghost" && { borderWidth: 1.5, borderColor: colors.border },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[s.text, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
const s = StyleSheet.create({
  btn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", paddingHorizontal: 16 },
  text: { fontSize: 16, fontWeight: "700" },
});