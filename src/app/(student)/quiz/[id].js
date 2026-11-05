import QuestionRunner from "@/components/learning/QuestionRunner";
import AccessCodeModal from "@/components/ui/AccessCodeModal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import { useHearts } from "@/hooks/useHearts";
import { finishQuiz, getQuiz } from "@/services/quizService";
import { isUnlocked, markUnlocked } from "@/utils/unlocked";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const hearts = useHearts();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getQuiz(id).then((q) => {
      setQuiz(q);
      setUnlocked(!!q && (!q.accessCode || isUnlocked(`quiz:${id}`)));
      setLoading(false);
    });
  }, [id]);

  if (loading || saving) return <Screen hasHeader><LoadingView /></Screen>;
  if (!quiz) return <Screen hasHeader><Text>Quiz not found.</Text></Screen>;
  if (!unlocked) {
    return (
      <Screen hasHeader>
        <AccessCodeModal
          visible title={quiz.title} correctCode={quiz.accessCode}
          onCancel={() => router.back()}
          onCorrect={() => { markUnlocked(`quiz:${id}`); setUnlocked(true); }} />
      </Screen>
    );
  }
  if (quiz.questions.length === 0) return <Screen hasHeader><Text>This quiz has no questions yet.</Text></Screen>;
  if (hearts.enabled && !hearts.canPlay) {
    return (
      <Screen hasHeader>
        <EmptyState
          icon="heart-dislike" title="Out of hearts"
          message={`A new heart arrives in about ${hearts.minutesToNext} min. Review a lesson while you wait!`}
          actionLabel="Back" onAction={() => router.back()} />
      </Screen>
    );
  }

  const onFinish = async (score, details) => {
    if (!user) return;
    setSaving(true);
    try {
      const r = await finishQuiz({ uid: user.uid, userName: profile ? profile.fullName : "", quiz, score, details });
      router.replace({
        pathname: "/quiz-result",
        params: { score: String(score), total: String(quiz.questions.length), xp: String(r.xpEarned), leveledUp: r.leveledUp ? "1" : "0" },
      });
    } catch (e) {
      setSaving(false);
    }
  };

  return (
    <Screen hasHeader>
      <Stack.Screen options={{ title: quiz.title }} />
      <QuestionRunner
        questions={quiz.questions}
        category={quiz.category || "General"}
        onAnswered={(correct) => { if (!correct) hearts.loseHeart(); }}
        onFinish={onFinish} />
    </Screen>
  );
}