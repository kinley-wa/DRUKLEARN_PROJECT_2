import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import AppTextField from "@/components/ui/AppTextField";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { deleteWord, getAllWords, saveWord } from "@/services/vocabularyService";
import { confirmDelete } from "@/utils/confirm";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function VocabularyForm() {
  const [words, setWords] = useState([]);
  const [editingId, setEditingId] = useState(undefined);
  const [word, setWord] = useState("");
  const [rom, setRom] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => setWords(await getAllWords()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const reset = () => { setEditingId(undefined); setWord(""); setRom(""); setMeaning(""); setExample(""); };
  const save = async () => {
    if (!word.trim() || !meaning.trim()) return Alert.alert("Missing information", "Add the Dzongkha word and its meaning.");
    setSaving(true);
    try {
      await saveWord({ id: editingId, word: word.trim(), romanization: rom.trim(), meaning: meaning.trim(), example: example.trim() });
      reset(); await load();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally { setSaving(false); }
  };

  return (
    <Screen hasHeader>
      <Text style={s.h}>{editingId ? "Edit word" : "Add a word"}</Text>
      <AppTextField label="Dzongkha word" value={word} onChangeText={setWord} />
      <AppTextField label="Romanization (optional)" value={rom} onChangeText={setRom} />
      <AppTextField label="English meaning" value={meaning} onChangeText={setMeaning} autoCapitalize="sentences" />
      <AppTextField label="Example usage (optional)" value={example} onChangeText={setExample} autoCapitalize="sentences" />
      <AppButton title={editingId ? "Save Changes" : "Add Word"} onPress={save} loading={saving} />
      {editingId ? <AppButton title="Cancel edit" variant="ghost" onPress={reset} style={{ marginTop: 8 }} /> : null}

      <Text style={[s.h, { marginTop: 24 }]}>All words ({words.length})</Text>
      {words.map((w) => (
        <AppCard key={w.id}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.w}>{w.word}</Text>
              <Text style={s.m}>{w.meaning}</Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => { setEditingId(w.id); setWord(w.word); setRom(w.romanization); setMeaning(w.meaning); setExample(w.example); }}>
              <Ionicons name="pencil" size={20} color={colors.goldDark} />
            </Pressable>
            <Pressable hitSlop={8} style={{ marginLeft: 16 }}
              onPress={() => confirmDelete(w.word, async () => { await deleteWord(w.id); load(); })}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </Pressable>
          </View>
        </AppCard>
      ))}
    </Screen>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  w: { fontSize: 18, fontWeight: "800", color: colors.text },
  m: { color: colors.textSecondary, fontSize: 13 },
});