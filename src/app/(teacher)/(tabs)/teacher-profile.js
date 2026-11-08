import TeacherScreen from "@/components/teacher/TeacherScreen";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { friendlyAuthError, sendReset } from "@/services/authService";
import { getAllLessons } from "@/services/lessonService";
import { getAllQuizzes } from "@/services/quizService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function TeacherProfile() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [mine, setMine] = useState({ lessons: 0, quizzes: 0 });

  useFocusEffect(useCallback(() => {
    if (!user) return;
    Promise.all([getAllLessons(), getAllQuizzes()]).then(([l, q]) => {
      setMine({
        lessons: l.filter((x) => x.createdBy === user.uid).length,
        quizzes: q.filter((x) => x.createdBy === user.uid).length,
      });
    }).catch(() => {});
  }, [user]));

  const resetPassword = async () => {
    if (!profile || !profile.email) return;
    try {
      await sendReset(profile.email);
      Alert.alert("Check your email", `A password reset link was sent to ${profile.email}.`);
    } catch (e) {
      Alert.alert("Couldn't send", friendlyAuthError(e));
    }
  };

  return (
    <TeacherScreen
      title={profile ? profile.fullName || "Teacher" : "Teacher"}
      subtitle={`Teacher • ${profile ? profile.email : ""}`}
      stats={[
        { icon: "book", value: mine.lessons, label: "My lessons", color: colors.blue },
        { icon: "help-circle", value: mine.quizzes, label: "My quizzes", color: colors.pink },
      ]}
    >
      <AppCard>
        <View style={s.avatarRow}>
          <View style={s.avatar}><Text style={s.av}>{((profile && profile.fullName) || "?").slice(0, 2).toUpperCase()}</Text></View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.name}>{profile ? profile.fullName : ""}</Text>
            <Text style={s.email}>{profile ? profile.email : ""}</Text>
          </View>
        </View>
      </AppCard>

      <AppButton title="Edit profile" icon="create-outline" variant="ghost" onPress={() => router.push("/edit-profile")} />
      <View style={{ height: 10 }} />
      <AppButton title="Send password reset email" icon="key-outline" variant="ghost" onPress={resetPassword} />

      <Pressable onPress={signOut} style={s.logout}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={s.lt}>Logout</Text>
      </Pressable>
      <Text style={s.version}>DrukLearn v2.0 • Teacher</Text>
    </TeacherScreen>
  );
}
const s = StyleSheet.create({
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.gold + "33", alignItems: "center", justifyContent: "center" },
  av: { fontSize: 20, fontWeight: "800", color: colors.goldDark },
  name: { fontSize: 17, fontWeight: "800", color: colors.text },
  email: { color: colors.textSecondary, fontSize: 13 },
  logout: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, marginTop: 8 },
  lt: { color: colors.error, fontWeight: "700", fontSize: 15 },
  version: { textAlign: "center", color: colors.textSecondary, fontSize: 12, marginTop: 8 },
});