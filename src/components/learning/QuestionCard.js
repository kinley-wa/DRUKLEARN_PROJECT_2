import { colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";
import SpeakButton from "./SpeakButton";

export default function QuestionCard({ question, selected, answered, onSelect }) {
  return (
    <View>
      <View style={s.prompt}>
        <Text style={s.promptText}>{question.text}</Text>
        {question.speak ? (
          <View style={{ marginTop: 14 }}>
            <SpeakButton word={{ romanization: question.speak, word: question.text }} size={30} color="#fff" />
          </View>
        ) : null}
      </View>
      {question.options.map((opt, i) => {
        const isSel = selected === i;
        const isCorrect = i === question.correctOptionIndex;
        let border = isSel ? colors.gold : colors.border;
        let bg = "#fff";
        if (answered) {
          if (isCorrect) { border = colors.success; bg = colors.success + "1A"; }
          else if (isSel) { border = colors.error; bg = colors.error + "1A"; }
        }
        return (
          <Pressable key={i} onPress={() => onSelect(i)} style={[s.option, { borderColor: border, backgroundColor: bg }]}>
            <Text style={[s.optionText, isSel && { fontWeight: "800" }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const s = StyleSheet.create({
  prompt: { backgroundColor: colors.navy, borderRadius: 20, padding: 28, marginBottom: 16, alignItems: "center" },
  promptText: { color: "#fff", fontSize: 22, fontWeight: "800", textAlign: "center" },
  option: { borderWidth: 2, borderRadius: 14, padding: 16, marginBottom: 10 },
  optionText: { fontSize: 16, color: colors.text },
});