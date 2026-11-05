import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "./AppButton";

export default function EmptyState({ icon = "folder-open-outline", title, message, actionLabel, onAction }) {
  return (
    <View style={s.c}>
      <Ionicons name={icon} size={52} color={colors.textSecondary} />
      <Text style={s.title}>{title}</Text>
      {message ? <Text style={s.msg}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: 18, alignSelf: "stretch" }}>
          <AppButton title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
const s = StyleSheet.create({
  c: { alignItems: "center", padding: 32 },
  title: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 12, textAlign: "center" },
  msg: { color: colors.textSecondary, textAlign: "center", marginTop: 6 },
});