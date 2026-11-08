import AppCard from "@/components/ui/AppCard";
import { colors } from "@/constants/theme";
import { getAllWords, pickWordOfTheDay } from "@/services/vocabularyService";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import SpeakButton from "./SpeakButton";

export default function WordOfTheDayCard() {
  const router = useRouter();
  const [word, setWord] = useState(null);
  useFocusEffect(useCallback(() => {
    getAllWords().then((w) => setWord(pickWordOfTheDay(w))).catch(() => {});
  }, []));
  if (!word) return null;
  return (
    <AppCard onPress={() => router.push("/vocabulary")}>
      <Text style={s.label}>WORD OF THE DAY</Text>
      <View style={s.row}>
        <Text style={s.word}>{word.word}</Text>
        <SpeakButton word={word} size={30} />
      </View>
      {word.romanization ? <Text style={s.rom}>{word.romanization}</Text> : null}
      <Text style={s.meaning}>{word.meaning}</Text>
      {word.example ? <Text style={s.ex}>{word.example}</Text> : null}
    </AppCard>
  );
}
const s = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "800", color: colors.goldDark, letterSpacing: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  word: { fontSize: 28, fontWeight: "800", color: colors.text, flex: 1 },
  rom: { color: colors.gold, fontWeight: "600" },
  meaning: { fontSize: 16, fontWeight: "700", color: colors.textSecondary, marginTop: 4 },
  ex: { color: colors.textSecondary, fontStyle: "italic", marginTop: 6, fontSize: 13 },
});