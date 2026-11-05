import QuestionRunner from "@/components/learning/QuestionRunner";
import AppButton from "@/components/ui/AppButton";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useHearts } from "@/hooks/useHearts";
import { buildReviewQuestions, finishReview } from "@/services/reviewService";
import { getWeakTopics } from "@/services/topicStatsService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Review() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const hearts = useHearts();
  const [category, setCategory] = useState(params.category || "");
  const [questions, setQuestions] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      let cat = params.category || "";
      if (!cat) {
        const weak = await getWeakTopics(user.uid);
        cat = weak[0] ? weak[0].category : "";
      }
      setCategory(cat);
      setQuestions(cat ? await buildReviewQuestions(cat) : []);
    })();
  }, [user]);

  if (!questions) return <Screen hasHeader><LoadingView /></Screen>;
  if (questions.length === 0) {
    return (
      <Screen hasHeader>
        <EmptyState
          icon="happy-outline"
          title={category ? "No review questions" : "Nothing to review!"}
          message={category
            ? "Your teacher hasn't added quizzes for this topic yet. Try its lessons instead."
            : "Keep taking quizzes. Topics you find difficult will show up here."}
          actionLabel={category ? "Open lessons" : "Take a quiz"}
          onAction={() => (category
            ? router.replace({ pathname: "/lessons", params: { category } })
            : router.replace("/practice"))} />
      </Screen>
    );
  }
  if (hearts.enabled && !hearts.canPlay) {
    return (
      <Screen hasHeader>
        <EmptyState icon="heart-dislike" title="Out of hearts"
          message={`A new heart arrives in about ${hearts.minutesToNext} min.`}
          actionLabel="Back" onAction={() => router.back()} />
      </Screen>
    );
  }
  if (result) {
    return (
      <Screen hasHeader>
        <View style={s.c}>
          <Ionicons name="ribbon" size={72} color={colors.purple} />
          <Text style={s.h}>Review done: {result.correct}/{result.total}</Text>
          <Text style={s.xp}>+{result.xp} XP</Text>
        </View>
        <AppButton title="Back to Home" onPress={() => router.replace("/home")} />
      </Screen>
    );
  }
  return (
    <Screen hasHeader>
      <Text style={s.topic}>Topic: {category}</Text>
      <QuestionRunner
        questions={questions}
        category={category}
        onAnswered={(correct) => { if (!correct) hearts.loseHeart(); }}
        onFinish={async (correct, details) => {
          if (!user) return;
          const xp = await finishReview(user.uid, correct, details);
          setResult({ correct, total: questions.length, xp });
        }} />
    </Screen>
  );
}
const s = StyleSheet.create({
  topic: { color: colors.purple, fontWeight: "800", marginBottom: 12 },
  c: { alignItems: "center", paddingVertical: 40 },
  h: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 14 },
  xp: { fontSize: 20, fontWeight: "800", color: colors.success },
});