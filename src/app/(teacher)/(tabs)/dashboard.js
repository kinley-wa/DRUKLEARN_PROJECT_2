import CategoryIcon from "@/components/learning/CategoryIcon";
import TeacherScreen from "@/components/teacher/TeacherScreen";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ProgressBar from "@/components/ui/ProgressBar";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getCompetition } from "@/services/competitionService";
import { deleteLesson, getAllLessons } from "@/services/lessonService";
import { deleteQuiz, getAllQuizzes } from "@/services/quizService";
import {
  duplicateLesson, duplicateQuiz, getCompetitionAttemptsAll, unpublishCompetition,
} from "@/services/teacherService";
import { deleteTopic, getTopics } from "@/services/topicService";
import { getAllStudents } from "@/services/userService";
import { getAllWords } from "@/services/vocabularyService";
import { confirmDelete } from "@/utils/confirm";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const TABS = [
  { key: "lessons", label: "Lessons", icon: "book" },
  { key: "quizzes", label: "Quizzes", icon: "help-circle" },
  { key: "competition", label: "Challenge", icon: "trophy" },
  { key: "path", label: "Path", icon: "map" },
  { key: "words", label: "Words", icon: "language" },
];
const ADD_ROUTE = { lessons: "/lesson-form", quizzes: "/quiz-form", competition: "/competition-form", path: "/topic-form", words: "/vocabulary-form" };
const ADD_LABEL = {
  lessons: "+ Add Lesson", quizzes: "+ Add Quiz", competition: "Create / Edit Weekly Competition",
  path: "+ Add Path Topic", words: "Manage Vocabulary",
};

function TabPill({ icon, label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.pill, selected && s.pillOn]}>
      <Ionicons name={icon} size={16} color={selected ? "#fff" : colors.textSecondary} />
      <Text style={[s.pillText, selected && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

function IconBtn({ icon, color = colors.textSecondary, onPress }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={s.iconBtn}>
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}

function CodePill({ code }) {
  return (
    <View style={s.code}>
      <Ionicons name="key" size={11} color={colors.goldDark} />
      <Text style={s.codeText}>{code || "no code"}</Text>
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("lessons");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [comp, setComp] = useState(null);
  const [compPlayed, setCompPlayed] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [l, q, t, st, w, c] = await Promise.all([
        getAllLessons(), getAllQuizzes(), getTopics(), getAllStudents(), getAllWords(), getCompetition(),
      ]);
      setLessons(l); setQuizzes(q); setTopics(t); setStudents(st); setWordCount(w.length); setComp(c);
      setCompPlayed(c ? (await getCompetitionAttemptsAll(c)).length : 0);
    } catch (e) {
      setError(true);
    } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const run = async (fn, failTitle) => {
    try { await fn(); await load(); } catch (e) { Alert.alert(failTitle, e.message); }
  };

  const q = search.trim().toLowerCase();
  const shownLessons = lessons.filter((l) => !q || l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q));
  const shownQuizzes = quizzes.filter((x) => !q || x.title.toLowerCase().includes(q) || (x.category || "").toLowerCase().includes(q));
  const active = students.filter((x) => x.xp > 0).length;
  const first = ((profile && profile.fullName) || "Teacher").split(" ")[0];

  return (
    <TeacherScreen
      title="Teacher Dashboard"
      subtitle={`Kuzu zangpo, ${first}! Manage your classroom content.`}
      stats={[
        { icon: "people", value: students.length, label: "Students", color: colors.gold },
        { icon: "flash", value: active, label: "Active", color: colors.green },
        { icon: "book", value: lessons.length, label: "Lessons", color: colors.blue },
        { icon: "help-circle", value: quizzes.length, label: "Quizzes", color: colors.pink },
      ]}
      onRefresh={load} refreshing={loading}
    >
      {error ? <ErrorState onRetry={load} /> : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginBottom: 14, flexGrow: 0 }}>
            {TABS.map((t) => (
              <TabPill key={t.key} icon={t.icon} label={t.label} selected={tab === t.key} onPress={() => { setTab(t.key); setSearch(""); }} />
            ))}
          </ScrollView>

          <AppButton title={ADD_LABEL[tab]} onPress={() => router.push(ADD_ROUTE[tab])} style={{ marginBottom: 14 }} />

          {tab === "lessons" || tab === "quizzes" ? (
            <View style={s.search}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                value={search} onChangeText={setSearch} placeholder={`Search ${tab} by name or category`}
                placeholderTextColor={colors.textSecondary} style={s.searchInput} />
            </View>
          ) : null}

          {/* ---------- lessons ---------- */}
          {tab === "lessons" && (shownLessons.length === 0 ? (
            <EmptyState icon="book-outline" title={q ? "No matching lessons" : "No lessons yet"} message="Tap + Add Lesson to create your first one." />
          ) : shownLessons.map((l) => (
            <AppCard key={l.id} onPress={() => router.push({ pathname: "/lesson-form", params: { id: l.id } })}>
              <View style={s.row}>
                <CategoryIcon category={l.category} />
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text style={s.rt} numberOfLines={1}>{l.title || "Untitled"}</Text>
                  <Text style={s.rs}>{l.sections.length} sections • {l.level} • {l.category}</Text>
                  <CodePill code={l.accessCode} />
                </View>
                <IconBtn icon="copy-outline" onPress={() => run(() => duplicateLesson(l, user.uid), "Couldn't copy")} />
                <IconBtn icon="trash-outline" color={colors.error} onPress={() => confirmDelete(l.title, () => run(() => deleteLesson(l.id), "Couldn't delete"))} />
              </View>
            </AppCard>
          )))}

          {/* ---------- quizzes ---------- */}
          {tab === "quizzes" && (shownQuizzes.length === 0 ? (
            <EmptyState icon="help-circle-outline" title={q ? "No matching quizzes" : "No quizzes yet"} message="Tap + Add Quiz to create your first one." />
          ) : shownQuizzes.map((qz) => (
            <AppCard key={qz.id} onPress={() => router.push({ pathname: "/quiz-stats", params: { id: qz.id } })}>
              <View style={s.row}>
                <View style={[s.qIcon, { backgroundColor: colors.blue + "26" }]}><Ionicons name="help-circle" size={24} color={colors.blue} /></View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text style={s.rt} numberOfLines={1}>{qz.title || "Untitled"}</Text>
                  <Text style={s.rs}>{qz.questions.length} questions • {qz.category || "no category"}</Text>
                  <CodePill code={qz.accessCode} />
                </View>
                <IconBtn icon="pencil" color={colors.goldDark} onPress={() => router.push({ pathname: "/quiz-form", params: { id: qz.id } })} />
                <IconBtn icon="copy-outline" onPress={() => run(() => duplicateQuiz(qz, user.uid), "Couldn't copy")} />
                <IconBtn icon="trash-outline" color={colors.error} onPress={() => confirmDelete(qz.title, () => run(() => deleteQuiz(qz.id), "Couldn't delete"))} />
              </View>
              <Text style={s.hint}>Tap the card to see results and the hardest questions</Text>
            </AppCard>
          )))}

          {/* ---------- weekly competition ---------- */}
          {tab === "competition" && (comp ? (
            <AppCard>
              <View style={s.row}>
                <View style={[s.qIcon, { backgroundColor: colors.gold + "33" }]}><Ionicons name="trophy" size={24} color={colors.goldDark} /></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.rt}>{comp.title}</Text>
                  <Text style={s.rs}>{comp.questions.length} questions • {comp.timeLimitMinutes} min • code {comp.accessCode || "none"}</Text>
                </View>
              </View>
              <Text style={[s.rs, { marginTop: 12 }]}>{compPlayed} of {students.length} students have played</Text>
              <View style={{ marginTop: 6 }}><ProgressBar value={students.length ? compPlayed / students.length : 0} color={colors.success} height={8} /></View>
              <View style={{ height: 14 }} />
              <AppButton title="View results" icon="podium" onPress={() => router.push("/competition-results")} />
              <View style={{ height: 8 }} />
              <AppButton title="Edit / publish a new round" variant="ghost" onPress={() => router.push("/competition-form")} />
              <View style={{ height: 8 }} />
              <AppButton
                title="Unpublish" variant="ghost"
                onPress={() => Alert.alert("Unpublish this challenge?", "Students will no longer see it. Saved results are kept.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Unpublish", style: "destructive", onPress: () => run(unpublishCompetition, "Couldn't unpublish") },
                ])} />
              <Text style={s.hint}>Publishing a new round lets every student play again.</Text>
            </AppCard>
          ) : (
            <EmptyState icon="trophy-outline" title="No active competition" message="Publish a weekly challenge for your students." />
          ))}

          {/* ---------- learning path ---------- */}
          {tab === "path" && (topics.length === 0 ? (
            <EmptyState icon="map-outline" title="No path topics" message="Without topics, the path is built from your lesson categories automatically." />
          ) : [...topics].sort((a, b) => a.order - b.order).map((t) => (
            <AppCard key={t.id} onPress={() => router.push({ pathname: "/topic-form", params: { id: t.id } })}>
              <View style={s.row}>
                <View style={s.order}><Text style={s.orderText}>{t.order}</Text></View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text style={s.rt}>{t.title}</Text>
                  <Text style={s.rs}>Category: {t.category} • {lessons.filter((l) => l.category === t.category).length} lessons</Text>
                </View>
                <IconBtn icon="trash-outline" color={colors.error} onPress={() => confirmDelete(t.title, () => run(() => deleteTopic(t.id), "Couldn't delete"))} />
              </View>
            </AppCard>
          )))}

          {/* ---------- words ---------- */}
          {tab === "words" ? (
            <AppCard>
              <View style={s.row}>
                <View style={[s.qIcon, { backgroundColor: colors.pink + "26" }]}><Ionicons name="language" size={24} color={colors.pink} /></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.rt}>{wordCount} vocabulary words</Text>
                  <Text style={s.rs}>Used for Word of the Day, vocabulary practice and the memory game.</Text>
                </View>
              </View>
              <Text style={s.hint}>The memory game needs at least 4 words with different meanings (8 for Hard).</Text>
            </AppCard>
          ) : null}
        </>
      )}
    </TeacherScreen>
  );
}
const s = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1.5, borderColor: colors.border },
  pillOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  pillText: { fontWeight: "700", color: colors.textSecondary, fontSize: 13 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 12, marginBottom: 14 },
  searchInput: { flex: 1, paddingVertical: 11, color: colors.text },
  row: { flexDirection: "row", alignItems: "center" },
  rt: { fontSize: 15, fontWeight: "800", color: colors.text },
  rs: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  hint: { color: colors.textSecondary, fontSize: 11, marginTop: 10, fontStyle: "italic" },
  iconBtn: { padding: 6 },
  qIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  code: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", marginTop: 6, backgroundColor: colors.gold + "26", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  codeText: { color: colors.goldDark, fontWeight: "800", fontSize: 11, letterSpacing: 0.5 },
  order: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center" },
  orderText: { color: "#fff", fontWeight: "800" },
});