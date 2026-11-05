import { ONBOARDED_KEY } from "@/constants/storage";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || user) return;
    AsyncStorage.getItem(ONBOARDED_KEY).then((v) => router.replace(v ? "/login" : "/onboarding"));
  }, [loading, user]);

  return (
    <View style={s.c}>
      <Text style={s.title}>DrukLearn</Text>
      <Text style={s.tag}>LEARN DZONGKHA, LEARN BHUTAN</Text>
      <ActivityIndicator color={colors.gold} style={{ marginTop: 28 }} />
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.navy },
  title: { color: "#fff", fontSize: 38, fontWeight: "800" },
  tag: { color: colors.gold, fontSize: 12, letterSpacing: 1.5, marginTop: 6 },
});