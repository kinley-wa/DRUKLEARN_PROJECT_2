import AppButton from "@/components/ui/AppButton";
import AppTextField from "@/components/ui/AppTextField";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { friendlyAuthError, loginUser, sendReset } from "@/services/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return setError("Please enter your email and password.");
    setError(""); setLoading(true);
    try { await loginUser(email.trim(), password); } // AuthContext + the Gate handle navigation
    catch (e) { setError(friendlyAuthError(e)); }
    finally { setLoading(false); }
  };

  const forgot = async () => {
    if (!email.trim()) return setError("Type your email first, then tap Forgot Password.");
    try { await sendReset(email.trim()); Alert.alert("Check your email", "A password reset link has been sent."); }
    catch (e) { setError(friendlyAuthError(e)); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen style={{ paddingTop: 48 }}>
        <Text style={s.title}>Welcome Back!</Text>
        <Text style={s.sub}>Login to continue learning Dzongkha</Text>
        <View style={{ height: 28 }} />
        <AppTextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="yourmail@gmail.com" />
        <AppTextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Text style={s.forgot} onPress={forgot}>Forgot Password?</Text>
        {error ? <Text style={s.error}>{error}</Text> : null}
        <AppButton title="Login" onPress={submit} loading={loading} />
        <Text style={s.foot}>
          Don't have an account? <Text style={s.link} onPress={() => router.push("/register")}>Register</Text>
        </Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  title: { fontSize: 30, fontWeight: "800", color: colors.text },
  sub: { color: colors.blue, fontWeight: "500", marginTop: 6 },
  forgot: { alignSelf: "flex-end", color: colors.blue, fontWeight: "600", marginBottom: 16 },
  error: { color: colors.error, backgroundColor: colors.error + "1A", padding: 12, borderRadius: 10, marginBottom: 12 },
  foot: { textAlign: "center", color: colors.textSecondary, marginTop: 24 },
  link: { color: colors.blue, fontWeight: "700" },
});