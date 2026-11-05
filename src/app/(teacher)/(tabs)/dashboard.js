import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { deleteLesson, getAllLessons } from "@/services/lessonService";
import { deleteQuiz, getAllQuizzes } from "@/services/quizService";
import { deleteTopic, getTopics } from "@/services/topicService";
import { confirmDelete } from "@/utils/confirm";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function Row({ title, sub, onEdit, onDelete }) {
  return (
    <AppCard>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.rt}>{title || "Untitled"}</Text>
          <Text style={s.rs}>{sub}</Text>
        </View>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Ionicons name="pencil" size={20} color={colors.goldDark} />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} style={{ marginLeft: 16 }}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </Pressable>
      </View>
    </AppCard>
  );
}

const ADD_ROUTE = { lessons: "/lesson-form", quizzes: "/quiz-form", competition: "/competition-form", path: "/topic-form", words: "/vocabulary-form" };
const ADD_LABEL = {
  lessons: "+ Add Lesson", quizzes: "+ Add Quiz", competition: "Create / Edit Weekly Competition",
  path: "+ Add Path Topic", words: "Manage Vocabulary",
};

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("lessons");
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l, q, t] = await Promise.all([getAllLessons(), getAllQuizzes(), getTopics()]);
      setLessons(l); setQuizzes(q); setTopics(t);
    } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen title="Teacher Dashboard" onRefresh={load} refreshing={loading}>
      <View style={s.chips}>
        <Chip label="Lessons" selected={tab === "lessons"} onPress={() => setTab("lessons")} />
        <Chip label="Quizzes" selected={tab === "quizzes"} onPress={() => setTab("quizzes")} />
        <Chip label="Challenge" selected={tab === "competition"} onPress={() => setTab("competition")} />
        <Chip label="Path" selected={tab === "path"} onPress={() => setTab("path")} />
        <Chip label="Words" selected={tab === "words"} onPress={() => setTab("words")} />
      </View>
      <AppButton title={ADD_LABEL[tab]} onPress={() => router.push(ADD_ROUTE[tab])} style={{ marginBottom: 16 }} />
      {loading && !lessons.length && !quizzes.length ? <LoadingView /> : null}

      {tab === "lessons" && (lessons.length === 0 && !loading ? <EmptyState title="No lessons yet" /> :
        lessons.map((l) => (
          <Row key={l.id} title={l.title}
            sub={`${l.sections.length} sections • ${l.level} • code ${l.accessCode || "-"}`}
            onEdit={() => router.push({ pathname: "/lesson-form", params: { id: l.id } })}
            onDelete={() => confirmDelete(l.title, async () => { await deleteLesson(l.id); load(); })} />
        )))}

      {tab === "quizzes" && (quizzes.length === 0 && !loading ? <EmptyState title="No quizzes yet" /> :
        quizzes.map((q) => (
          <Row key={q.id} title={q.title}
            sub={`${q.questions.length} questions • ${q.category || "no category"} • code ${q.accessCode || "-"}`}
            onEdit={() => router.push({ pathname: "/quiz-form", params: { id: q.id } })}
            onDelete={() => confirmDelete(q.title, async () => { await deleteQuiz(q.id); load(); })} />
        )))}

      {tab === "competition" ? (
        <AppCard><Text style={s.rs}>Sets the single weekly challenge every student sees. Publishing a new one replaces the old.</Text></AppCard>
      ) : null}

      {tab === "path" && (topics.length === 0 && !loading ?
        <EmptyState title="No path topics" message="Without topics, the path is built from lesson categories automatically." /> :
        [...topics].sort((a, b) => a.order - b.order).map((t) => (
          <Row key={t.id} title={`${t.order}. ${t.title}`} sub={`Category: ${t.category}`}
            onEdit={() => router.push({ pathname: "/topic-form", params: { id: t.id } })}
            onDelete={() => confirmDelete(t.title, async () => { await deleteTopic(t.id); load(); })} />
        )))}

      {tab === "words" ? (
        <AppCard><Text style={s.rs}>Add the Dzongkha words students see as Word of the Day and in vocabulary practice.</Text></AppCard>
      ) : null}
    </Screen>
  );
}
const s = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center" },
  rt: { fontSize: 15, fontWeight: "700", color: colors.text },
  rs: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});