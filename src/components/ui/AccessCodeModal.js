import { colors } from "@/constants/theme";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import AppButton from "./AppButton";
import AppTextField from "./AppTextField";

export default function AccessCodeModal({ visible, title, correctCode, onCorrect, onCancel }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => { if (visible) { setInput(""); setError(false); } }, [visible]);

  const submit = () => {
    if (input.trim().toUpperCase() === correctCode.trim().toUpperCase()) onCorrect();
    else setError(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.title}>Enter Access Code</Text>
          <Text style={s.msg}>"{title}" requires a code from your teacher.</Text>
          <AppTextField
            value={input}
            onChangeText={(t) => { setInput(t.toUpperCase()); setError(false); }}
            placeholder="CODE"
            autoCapitalize="characters"
          />
          {error ? <Text style={s.err}>Incorrect code. Please try again.</Text> : null}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <AppButton title="Cancel" variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
            <AppButton title="Unlock" onPress={submit} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  msg: { color: colors.textSecondary, marginVertical: 10 },
  err: { color: colors.error, marginBottom: 10 },
});