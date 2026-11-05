import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function TeacherProfile() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  return (
    <Screen title="Profile">
      <View style={s.top}>
        <View style={s.avatar}><Text style={s.av}>{((profile && profile.fullName) || "?").slice(0, 2).toUpperCase()}</Text></View>
        <Text style={s.name}>{profile ? profile.fullName : ""}</Text>
        <Text style={s.role}>Teacher • {profile ? profile.email : ""}</Text>
      </View>
      <AppButton title="Edit Profile" variant="ghost" onPress={() => router.push("/edit-profile")} />
      <Pressable onPress={signOut} style={s.logout}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={s.lt}>Logout</Text>
      </Pressable>
    </Screen>
  );
}
const s = StyleSheet.create({
  top: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.gold + "33", alignItems: "center", justifyContent: "center" },
  av: { fontSize: 26, fontWeight: "800", color: colors.goldDark },
  name: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 10 },
  role: { color: colors.textSecondary },
  logout: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, marginTop: 8 },
  lt: { color: colors.error, fontWeight: "700", fontSize: 15 },
});