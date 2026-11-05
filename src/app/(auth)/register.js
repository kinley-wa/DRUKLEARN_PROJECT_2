import AppButton from "@/components/ui/AppButton";
import AppTextField from "@/components/ui/AppTextField";
import Chip from "@/components/ui/Chip";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { friendlyAuthError, registerUser } from "@/services/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !password) return setError("Please fill in all fields.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setError(""); setLoading(true);
    try { await registerUser(name.trim(), email.trim(), password, role); }
    catch (e) { setError(friendlyAuthError(e)); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen style={{ paddingTop: 32 }}>
        <Text style={s.title}>Create Account</Text>
        <Text style={s.sub}>Join DrukLearn today</Text>
        <View style={{ height: 24 }} />
        <AppTextField label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" />
        <AppTextField label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <AppTextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <AppTextField label="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry />
        <Text style={s.label}>I am a:</Text>
        <View style={s.row}>
          <Chip label="Student" selected={role === "student"} onPress={() => setRole("student")} />
          <Chip label="Teacher" selected={role === "teacher"} onPress={() => setRole("teacher")} />
        </View>
        {error ? <Text style={s.error}>{error}</Text> : null}
        <AppButton title="Register" onPress={submit} loading={loading} />
        <Text style={s.foot}>
          Already have an account? <Text style={s.link} onPress={() => router.back()}>Login</Text>
        </Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  title: { fontSize: 30, fontWeight: "800", color: colors.text },
  sub: { color: colors.blue, fontWeight: "500", marginTop: 6 },
  label: { fontWeight: "600", color: colors.text, marginBottom: 8 },
  row: { flexDirection: "row", gap: 10, marginBottom: 16 },
  error: { color: colors.error, backgroundColor: colors.error + "1A", padding: 12, borderRadius: 10, marginBottom: 12 },
  foot: { textAlign: "center", color: colors.textSecondary, marginTop: 24 },
  link: { color: colors.blue, fontWeight: "700" },
});