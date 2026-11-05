import { colors } from "@/constants/theme";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// hasHeader = true on stack screens that show the native header (removes the extra top padding)
export default function Screen({ children, title, scroll = true, hasHeader = false, style, refreshing, onRefresh }) {
  const body = (
    <>
      {title ? <Text style={s.title}>{title}</Text> : null}
      {children}
    </>
  );
  return (
    <SafeAreaView style={s.safe} edges={hasHeader ? ["bottom"] : ["top"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[s.content, style]}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={[s.content, { flex: 1 }, style]}>{body}</View>
      )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: 16 },
});