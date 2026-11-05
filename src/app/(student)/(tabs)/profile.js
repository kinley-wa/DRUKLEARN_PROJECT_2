import XpBar from "@/components/learning/XpBar";
import AppCard from "@/components/ui/AppCard";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ROWS = [
  { icon: "stats-chart", label: "My Progress", go: "/my-progress" },
  { icon: "medal", label: "Achievements", go: "/achievements" },
  { icon: "checkmark-done", label: "Daily Missions", go: "/missions" },
  { icon: "language", label: "Vocabulary", go: "/vocabulary" },
  { icon: "settings", label: "Settings", go: "/settings" },
  { icon: "help-buoy", label: "Help & Support", go: "/help-support" },
];

export default function Profile() {
  const router = useRouter();
  const { profile, refreshProfile, signOut } = useAuth();
  useFocusEffect(useCallback(() => { refreshProfile(); }, [refreshProfile]));

  return (
    <Screen title="Profile">
      <View style={s.top}>
        <View style={s.avatar}><Text style={s.av}>{((profile && profile.fullName) || "?").slice(0, 2).toUpperCase()}</Text></View>
        <Text style={s.name}>{profile ? profile.fullName : ""}</Text>
        <Text style={s.role}>{profile ? profile.email : ""}</Text>
        <Text style={s.edit} onPress={() => router.push("/edit-profile")}>Edit Profile</Text>
      </View>
      <View style={s.stats}>
        <View style={s.stat}><Text style={s.sv}>{profile ? profile.xp : 0}</Text><Text style={s.sl}>XP</Text></View>
        <View style={s.stat}><Text style={s.sv}>{profile ? profile.streak : 0}</Text><Text style={s.sl}>Day Streak</Text></View>
        <View style={s.stat}><Text style={s.sv}>{profile ? profile.badges.length : 0}</Text><Text style={s.sl}>Badges</Text></View>
      </View>
      <XpBar xp={profile ? profile.xp : 0} />
      {ROWS.map((r) => (
        <AppCard key={r.label} onPress={() => router.push(r.go)} style={{ paddingVertical: 14 }}>
          <View style={s.row}>
            <Ionicons name={r.icon} size={22} color={colors.textSecondary} />
            <Text style={s.rl}>{r.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
        </AppCard>
      ))}
      <Pressable onPress={signOut} style={s.logout}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={s.lt}>Logout</Text>
      </Pressable>
    </Screen>
  );
}
const s = StyleSheet.create({
  top: { alignItems: "center", marginBottom: 16 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.gold + "33", alignItems: "center", justifyContent: "center" },
  av: { fontSize: 26, fontWeight: "800", color: colors.goldDark },
  name: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 10 },
  role: { color: colors.textSecondary },
  edit: { color: colors.blue, fontWeight: "700", marginTop: 8 },
  stats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  stat: { alignItems: "center" },
  sv: { fontSize: 22, fontWeight: "800", color: colors.text },
  sl: { color: colors.textSecondary, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rl: { flex: 1, fontSize: 15, color: colors.text },
  logout: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  lt: { color: colors.error, fontWeight: "700", fontSize: 15 },
});