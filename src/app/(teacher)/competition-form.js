import QuestionEditor, { emptyQuestion } from "@/components/learning/QuestionEditor";
import AppButton from "@/components/ui/AppButton";
import AppTextField from "@/components/ui/AppTextField";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getCompetition, saveCompetition } from "@/services/competitionService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text } from "react-native";

export default function CompetitionForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("2");
  const [accessCode, setAccessCode] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);

  useEffect(() => {
    getCompetition().then((c) => {
      if (c) {
        setTitle(c.title); setTimeLimit(String(c.timeLimitMinutes)); setAccessCode(c.accessCode); setQuestions(c.questions);
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    const valid = questions.filter((q) => q.text.trim() && q.options.every((o) => o.trim()));
    if (!title.trim() || valid.length === 0) {
      return Alert.alert("Missing information", "Add a title and at least one complete question.");
    }
    setSaving(true);
    try {
      await saveCompetition({
        title: title.trim(), lessonId: "", lessonTitle: "", category: "Challenge",
        timeLimitMinutes: parseInt(timeLimit, 10) || 2, questions: valid,
        accessCode: accessCode.trim().toUpperCase(), createdBy: user ? user.uid : "",
      });
      router.back();
    } catch (e) {
      Alert.alert("Couldn't publish", e.message);
    } finally { setSaving(false); }
  };

  if (loading) return <Screen hasHeader><LoadingView /></Screen>;
  return (
    <Screen hasHeader>
      <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
        Publishing replaces the current challenge, and every student can attempt the new one once.
      </Text>
      <AppTextField label="Competition title" value={title} onChangeText={setTitle} autoCapitalize="words" />
      <AppTextField label="Time limit (minutes)" value={timeLimit} onChangeText={(t) => setTimeLimit(t.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
      <AppTextField label="Access code (optional)" value={accessCode} onChangeText={(t) => setAccessCode(t.toUpperCase())} autoCapitalize="characters" />
      <QuestionEditor questions={questions} onChange={setQuestions} />
      <AppButton title="Publish This Week's Competition" onPress={save} loading={saving} style={{ marginTop: 16 }} />
    </Screen>
  );
}