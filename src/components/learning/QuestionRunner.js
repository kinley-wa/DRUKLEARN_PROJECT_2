import AppButton from "@/components/ui/AppButton";
import ProgressBar from "@/components/ui/ProgressBar";
import { colors } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import QuestionCard from "./QuestionCard";

export default function QuestionRunner({ questions, category = "General", timeLimitSeconds, onAnswered, onFinish }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds || 0);
  const score = useRef(0);
  const details = useRef([]);
  const done = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish; // always call the latest version
  const q = questions[index];

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onFinishRef.current(score.current, details.current);
  };

  useEffect(() => {
    if (!timeLimitSeconds) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); finish(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const press = () => {
    if (!answered) {
      const correct = selected === q.correctOptionIndex;
      if (correct) score.current += 1;
      details.current.push({ questionId: q.id, category: q.category || category, correct });
      setAnswered(true);
      if (onAnswered) onAnswered(correct, q);
    } else if (index >= questions.length - 1) {
      finish();
    } else {
      setIndex(index + 1); setSelected(null); setAnswered(false);
    }
  };

  return (
    <View>
      <View style={s.top}>
        <Text style={s.count}>Question {index + 1} of {questions.length}</Text>
        {timeLimitSeconds ? (
          <Text style={[s.timer, secondsLeft < 30 && { color: colors.error }]}>
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
          </Text>
        ) : null}
      </View>
      <ProgressBar value={(index + 1) / questions.length} />
      <View style={{ height: 18 }} />
      <QuestionCard question={q} selected={selected} answered={answered} onSelect={(i) => !answered && setSelected(i)} />
      <AppButton
        title={!answered ? "Check" : index >= questions.length - 1 ? "Finish" : "Next"}
        onPress={press}
        disabled={selected === null}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}
const s = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  count: { color: colors.textSecondary, fontWeight: "600" },
  timer: { fontWeight: "800", color: colors.text },
});