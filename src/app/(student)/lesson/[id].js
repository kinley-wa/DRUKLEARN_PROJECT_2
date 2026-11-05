import AccessCodeModal from "@/components/ui/AccessCodeModal";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import LoadingView from "@/components/ui/LoadingView";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getLesson } from "@/services/lessonService";
import { getProgressForUser, saveLessonProgress } from "@/services/progressService";
import { isUnlocked, markUnlocked } from "@/utils/unlocked";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LessonDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [wasCompleted, setWasCompleted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const l = await getLesson(id);
      setLesson(l);
      if (l && user) {
        const p = (await getProgressForUser(user.uid)).find((x) => x.lessonId === id);
        setWasCompleted(!!(p && p.completed));
        if (p && !p.completed) setIndex(Math.min(p.sectionsCompleted, Math.max(0, l.sections.length - 1)));
        setUnlocked(!l.accessCode || isUnlocked(`lesson:${id}`));
      }
      setLoading(false);
    })();
  }, [id, user]);

  if (loading) return <Screen hasHeader><LoadingView /></Screen>;
  if (!lesson) return <Screen hasHeader><Text>Lesson not found.</Text></Screen>;
  if (!unlocked) {
    return (
      <Screen hasHeader>
        <AccessCodeModal
          visible title={lesson.title} correctCode={lesson.accessCode}
          onCancel={() => router.back()}
          onCorrect={() => { markUnlocked(`lesson:${id}`); setUnlocked(true); }} />
      </Screen>
    );
  }
  if (lesson.sections.length === 0) {
    return <Screen hasHeader><Text>This lesson has no content yet. Ask your teacher to add sections.</Text></Screen>;
  }

  const sec = lesson.sections[index];
  const last = index >= lesson.sections.length - 1;

  const next = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      const r = await saveLessonProgress({ uid: user.uid, lesson, sectionsCompleted: index + 1, wasCompleted });
      if (last) {
        router.replace({
          pathname: "/lesson-complete",
          params: { xp: String(r.xpEarned), title: lesson.title, leveledUp: r.leveledUp ? "1" : "0" },
        });
      } else {
        setIndex(index + 1);
      }
    } finally { setBusy(false); }
  };

  return (
    <Screen hasHeader>
      <Stack.Screen options={{ title: lesson.title }} />
      <Text style={s.count}>Section {index + 1} of {lesson.sections.length}</Text>
      <ProgressBar value={(index + 1) / lesson.sections.length} />
      <View style={s.hero}><Text style={s.word}>{sec.content}</Text></View>
      <AppCard>
        <Text style={s.label}>ENGLISH TRANSLATION</Text>
        <Text style={s.trans}>{sec.translation || "-"}</Text>
        {sec.exampleDialogue ? (
          <>
            <Text style={[s.label, { marginTop: 14 }]}>EXAMPLE</Text>
            <Text style={s.ex}>{sec.exampleDialogue}</Text>
          </>
        ) : null}
      </AppCard>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <AppButton title="Back" variant="ghost" onPress={() => setIndex(index - 1)} disabled={index === 0} style={{ flex: 1 }} />
        <AppButton title={last ? "Finish" : "Next"} onPress={next} loading={busy} style={{ flex: 2 }} />
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  count: { color: colors.textSecondary, fontWeight: "600", marginBottom: 8 },
  hero: { backgroundColor: colors.navy, borderRadius: 22, paddingVertical: 56, paddingHorizontal: 20, marginVertical: 18, alignItems: "center" },
  word: { color: "#fff", fontSize: 32, fontWeight: "800", textAlign: "center" },
  label: { fontSize: 11, color: colors.textSecondary, fontWeight: "700", letterSpacing: 0.5 },
  trans: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 4 },
  ex: { color: colors.text, marginTop: 4, fontSize: 14 },
});