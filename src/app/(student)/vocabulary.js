import WordCard from "@/components/learning/WordCard";
import AppButton from "@/components/ui/AppButton";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getAllWords, getSavedIds, pickWordOfTheDay, setSaved } from "@/services/vocabularyService";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Vocabulary() {
  const router = useRouter();
  const { user } = useAuth();
  const [words, setWords] = useState([]);
  const [saved, setSavedIds] = useState(new Set());
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [w, sv] = await Promise.all([getAllWords(), getSavedIds(user.uid)]);
      setWords(w); setSavedIds(sv);
    } finally { setLoading(false); }
  }, [user]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggle = async (w) => {
    if (!user) return;
    const next = new Set(saved);
    const nowSaved = !next.has(w.id);
    if (nowSaved) next.add(w.id); else next.delete(w.id);
    setSavedIds(next);
    await setSaved(user.uid, w.id, nowSaved, next.size);
  };

  const today = pickWordOfTheDay(words);
  const list = tab === "saved" ? words.filter((w) => saved.has(w.id)) : words;

  if (loading && !words.length) return <Screen hasHeader><LoadingView /></Screen>;
  return (
    <Screen hasHeader>
      {today ? (
        <>
          <Text style={s.h}>Word of the Day</Text>
          <WordCard word={today} large saved={saved.has(today.id)} onToggleSave={() => toggle(today)} />
        </>
      ) : null}
      <AppButton title="Practise Vocabulary" icon="school" onPress={() => router.push("/vocabulary-practice")} disabled={words.length < 4} />
      {words.length < 4 ? <Text style={s.hint}>Practice unlocks once your teacher has added at least 4 words.</Text> : null}
      <View style={s.chips}>
        <Chip label="All words" selected={tab === "all"} onPress={() => setTab("all")} />
        <Chip label={`Saved (${saved.size})`} selected={tab === "saved"} onPress={() => setTab("saved")} />
      </View>
      {list.length === 0 ? (
        <EmptyState
          icon="language"
          title={tab === "saved" ? "No saved words" : "No words yet"}
          message={tab === "saved" ? "Tap the bookmark on a word to save it." : "Your teacher hasn't added words yet."} />
      ) : list.map((w) => <WordCard key={w.id} word={w} saved={saved.has(w.id)} onToggleSave={() => toggle(w)} />)}
    </Screen>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 10 },
  hint: { color: colors.textSecondary, fontSize: 12, marginTop: 6 },
  chips: { flexDirection: "row", gap: 8, marginVertical: 14 },
});