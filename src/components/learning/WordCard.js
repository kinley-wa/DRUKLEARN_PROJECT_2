import { colors, radius, shadow } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import SpeakButton from "./SpeakButton";

export default function WordCard({ word, saved, onToggleSave, large }) {
  const main = large ? "#fff" : colors.text;
  const soft = large ? "#C7CCDC" : colors.textSecondary;
  return (
    <View style={[s.card, large && { backgroundColor: colors.navy }]}>
      <View style={{ flex: 1 }}>
        <Text style={[s.word, { color: main }, large && { fontSize: 32 }]}>{word.word}</Text>
        {word.romanization ? <Text style={s.rom}>{word.romanization}</Text> : null}
        <Text style={[s.meaning, { color: soft }]}>{word.meaning}</Text>
        {word.example ? <Text style={[s.ex, { color: soft }]}>{word.example}</Text> : null}
      </View>
      <View style={s.actions}>
        <SpeakButton word={word} />
        {onToggleSave ? (
          <Pressable onPress={onToggleSave} hitSlop={10}>
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={26} color={saved ? colors.gold : soft} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  card: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 12, ...shadow },
  word: { fontSize: 22, fontWeight: "800" },
  rom: { color: colors.gold, fontWeight: "600", marginTop: 2 },
  meaning: { fontSize: 16, fontWeight: "700", marginTop: 6 },
  ex: { fontSize: 13, marginTop: 6, fontStyle: "italic" },
  actions: { alignItems: "center", justifyContent: "space-between", gap: 14, marginLeft: 12 },
});