import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import AppTextField from "@/components/ui/AppTextField";
import { colors } from "@/constants/theme";
import { makeId } from "@/utils/random";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export const emptyQuestion = () => ({ id: makeId(), text: "", options: ["", "", "", ""], correctOptionIndex: 0 });

export default function QuestionEditor({ questions, onChange }) {
  const [count, setCount] = useState(String(questions.length || 4));

  const update = (i, patch) => onChange(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const apply = () => {
    const n = Math.max(1, Math.min(30, parseInt(count, 10) || 1));
    if (n > questions.length) {
      onChange([...questions, ...Array.from({ length: n - questions.length }, emptyQuestion)]);
    } else {
      onChange(questions.slice(0, n));
    }
  };

  return (
    <View>
      <Text style={s.h}>Number of Questions</Text>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
        <View style={{ width: 100 }}>
          <AppTextField value={count} onChangeText={(t) => setCount(t.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
        </View>
        <AppButton title="Apply" variant="ghost" onPress={apply} style={{ height: 48 }} />
      </View>

      <Text style={s.h}>Questions ({questions.length})</Text>
      {questions.map((q, i) => (
        <AppCard key={q.id}>
          <View style={s.head}>
            <Text style={s.qn}>Question {i + 1}</Text>
            {questions.length > 1 ? (
              <Pressable onPress={() => onChange(questions.filter((_, idx) => idx !== i))}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </Pressable>
            ) : null}
          </View>
          <AppTextField value={q.text} onChangeText={(t) => update(i, { text: t })} placeholder="Question text" autoCapitalize="sentences" />
          <Text style={s.hint}>Tap the circle next to the correct answer</Text>
          {q.options.map((opt, oi) => (
            <View key={oi} style={s.opt}>
              <Pressable onPress={() => update(i, { correctOptionIndex: oi })} hitSlop={8}>
                <Ionicons
                  name={q.correctOptionIndex === oi ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={q.correctOptionIndex === oi ? colors.success : colors.textSecondary}
                />
              </Pressable>
              <TextInput
                value={opt}
                placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                placeholderTextColor={colors.textSecondary}
                onChangeText={(t) => update(i, { options: q.options.map((o, k) => (k === oi ? t : o)) })}
                style={s.optInput}
              />
            </View>
          ))}
        </AppCard>
      ))}
      <AppButton title="+ Add One More Question" variant="ghost" onPress={() => onChange([...questions, emptyQuestion()])} />
    </View>
  );
}
const s = StyleSheet.create({
  h: { fontWeight: "800", color: colors.text, marginVertical: 10, fontSize: 15 },
  head: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  qn: { fontWeight: "700", color: colors.text },
  hint: { color: colors.textSecondary, fontSize: 12, marginBottom: 6 },
  opt: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  optInput: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.text },
});