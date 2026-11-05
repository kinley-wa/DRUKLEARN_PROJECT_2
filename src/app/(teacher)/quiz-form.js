import QuestionEditor, { emptyQuestion } from "@/components/learning/QuestionEditor";
import AppButton from "@/components/ui/AppButton";
import AppTextField from "@/components/ui/AppTextField";
import Chip from "@/components/ui/Chip";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { CATEGORY_OPTIONS } from "@/constants/categories";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getAllLessons } from "@/services/lessonService";
import { getQuiz, saveQuiz } from "@/services/quizService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function QuizForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [lessonId, setLessonId] = useState("");
  const [timeLimit, setTimeLimit] = useState("10");
  const [accessCode, setAccessCode] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);

  useEffect(() => {
    (async () => {
      setLessons(await getAllLessons());
      if (id) {
        const q = await getQuiz(id);
        if (q) {
          setTitle(q.title); setCategory(q.category || CATEGORY_OPTIONS[0]); setLessonId(q.lessonId);
          setTimeLimit(String(q.timeLimitMinutes)); setAccessCode(q.accessCode);
          setQuestions(q.questions.length ? q.questions : [emptyQuestion()]);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const save = async () => {
    const valid = questions.filter((q) => q.text.trim() && q.options.every((o) => o.trim()));
    if (!title.trim() || !accessCode.trim() || valid.length === 0) {
      return Alert.alert("Missing information", "Add a title, access code and at least one complete question (text + 4 options).");
    }
    const lesson = lessons.find((l) => l.id === lessonId);
    setSaving(true);
    try {
      await saveQuiz({
        id, title: title.trim(), category: category.trim(), lessonId, lessonTitle: lesson ? lesson.title : "",
        timeLimitMinutes: parseInt(timeLimit, 10) || 10, questions: valid,
        accessCode: accessCode.trim().toUpperCase(), createdBy: user ? user.uid : "",
      });
      router.back();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally { setSaving(false); }
  };

  if (loading) return <Screen hasHeader><LoadingView /></Screen>;
  return (
    <Screen hasHeader>
      <AppTextField label="Quiz Title" value={title} onChangeText={setTitle} autoCapitalize="words" />
      <Text style={s.l}>Topic category (used by Personalized Review)</Text>
      <View style={s.row}>
        {CATEGORY_OPTIONS.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}
      </View>
      <AppTextField value={category} onChangeText={setCategory} placeholder="or type a category" autoCapitalize="words" />
      <Text style={s.l}>Linked lesson (optional)</Text>
      <View style={s.row}>
        <Chip label="None" selected={!lessonId} onPress={() => setLessonId("")} />
        {lessons.map((l) => <Chip key={l.id} label={l.title} selected={lessonId === l.id} onPress={() => setLessonId(l.id)} />)}
      </View>
      <AppTextField label="Time limit (minutes, shown to students)" value={timeLimit}
        onChangeText={(t) => setTimeLimit(t.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
      <AppTextField label="Access Code (students must enter it)" value={accessCode}
        onChangeText={(t) => setAccessCode(t.toUpperCase())} autoCapitalize="characters" placeholder="e.g. QUIZ1A" />
      <QuestionEditor questions={questions} onChange={setQuestions} />
      <AppButton title={id ? "Save Changes" : "Save Quiz"} onPress={save} loading={saving} style={{ marginTop: 16 }} />
    </Screen>
  );
}
const s = StyleSheet.create({
  l: { fontWeight: "700", color: colors.text, marginBottom: 8, marginTop: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
});