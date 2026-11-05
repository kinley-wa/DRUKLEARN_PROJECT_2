import QuestionRunner from "@/components/learning/QuestionRunner";
import AppButton from "@/components/ui/AppButton";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { buildVocabQuestions, finishVocabPractice, getAllWords, getSavedIds } from "@/services/vocabularyService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function VocabularyPractice() {
  const router = useRouter();
  const { user } = useAuth();
  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setQuestions(null); setResult(null);
      const [all, saved] = await Promise.all([getAllWords(), getSavedIds(user.uid)]);
      const savedWords = all.filter((w) => saved.has(w.id));
      // practise saved words first; use all words when fewer than 4 are saved
      setQuestions(buildVocabQuestions(savedWords.length >= 4 ? savedWords : all, all));
    })();
  }, [user, round]);

  if (!questions) return <Screen hasHeader><LoadingView /></Screen>;
  if (questions.length === 0) {
    return (
      <Screen hasHeader>
        <EmptyState icon="language" title="Not enough words" message="At least 4 words with different meanings are needed."
          actionLabel="Back" onAction={() => router.back()} />
      </Screen>
    );
  }
  if (result) {
    return (
      <Screen hasHeader>
        <View style={s.c}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          <Text style={s.h}>{result.correct} / {result.total} correct</Text>
          <Text style={s.xp}>+{result.xp} XP</Text>
        </View>
        <AppButton title="Practise Again" onPress={() => setRound(round + 1)} />
        <View style={{ height: 10 }} />
        <AppButton title="Done" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }
  return (
    <Screen hasHeader>
      <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>What does this word mean?</Text>
      <QuestionRunner
        key={round}
        questions={questions}
        onFinish={async (correct) => {
          if (!user) return;
          const xp = await finishVocabPractice(user.uid, correct, questions.length);
          setResult({ correct, total: questions.length, xp });
        }} />
    </Screen>
  );
}
const s = StyleSheet.create({
  c: { alignItems: "center", paddingVertical: 40 },
  h: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 14 },
  xp: { fontSize: 20, fontWeight: "800", color: colors.success, marginTop: 8 },
});