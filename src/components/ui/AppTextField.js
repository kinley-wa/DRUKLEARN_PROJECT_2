import { colors } from "@/constants/theme";
import { StyleSheet, Text, TextInput, View } from "react-native";

// autoCapitalize defaults to "none". Pass "words" / "sentences" on name and text fields.
export default function AppTextField({ label, style, ...rest }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        style={[s.input, rest.multiline && { minHeight: 90, textAlignVertical: "top" }, style]}
        {...rest}
      />
    </View>
  );
}
const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.text,
  },
});