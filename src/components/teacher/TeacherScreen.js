import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// stats = [{ icon, value, label, color }]
// hasHeader = true on stack screens that already show the native header
export default function TeacherScreen({ title, subtitle, stats, hasHeader, children, onRefresh, refreshing }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.root}>
      <StatusBar style={hasHeader ? "dark" : "light"} />
      <View style={[s.banner, { paddingTop: hasHeader ? 14 : insets.top + 14 }]}>
        <View style={s.glow} />
        <Text style={s.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
        {stats && stats.length ? (
          <View style={s.stats}>
            {stats.map((st) => (
              <View key={st.label} style={s.stat}>
                <View style={[s.statIcon, { backgroundColor: (st.color || colors.gold) + "33" }]}>
                  <Ionicons name={st.icon} size={16} color={st.color || colors.gold} />
                </View>
                <Text style={s.statValue}>{st.value}</Text>
                <Text style={s.statLabel} numberOfLines={1}>{st.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      >
        {children}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  banner: {
    backgroundColor: colors.navy, paddingHorizontal: 20, paddingBottom: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden",
  },
  glow: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: colors.navyLight, top: -90, right: -60 },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  sub: { color: "#C7CCDC", marginTop: 4, fontSize: 13 },
  stats: { flexDirection: "row", gap: 8, marginTop: 16 },
  stat: { flex: 1, backgroundColor: "rgba(255,255,255,0.09)", borderRadius: 14, paddingVertical: 10, alignItems: "center" },
  statIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  statValue: { color: "#fff", fontWeight: "800", fontSize: 17 },
  statLabel: { color: "#C7CCDC", fontSize: 10, marginTop: 1 },
  content: { padding: 20 },
});