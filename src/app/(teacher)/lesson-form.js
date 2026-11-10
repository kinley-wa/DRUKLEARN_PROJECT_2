import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import AppTextField from "@/components/ui/AppTextField";
import Chip from "@/components/ui/Chip";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { CATEGORY_OPTIONS } from "@/constants/categories";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getLesson, saveLesson } from "@/services/lessonService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

const blank = () => ({ content: "", translation: "", exampleDialogue: "" });

export default function LessonForm() {
  const { id, category: presetCategory } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [category, setCategory] = useState(presetCategory || CATEGORY_OPTIONS[0]);  const [lessonType, setLessonType] = useState("Vocabulary");
  const [accessCode, setAccessCode] = useState("");
  const [sections, setSections] = useState([blank()]);

  useEffect(() => {
    if (!id) return;
    getLesson(id).then((l) => {
      if (l) {
        setTitle(l.title); setLevel(l.level); setCategory(l.category); setLessonType(l.lessonType);
        setAccessCode(l.accessCode); setSections(l.sections.length ? l.sections : [blank()]);
      }
      setLoading(false);
    });
  }, [id]);

  const setSection = (i, patch) => setSections(sections.map((sec, idx) => (idx === i ? { ...sec, ...patch } : sec)));

  const save = async () => {
    const valid = sections.filter((sec) => sec.content.trim());
    if (!title.trim() || !accessCode.trim() || !category.trim() || valid.length === 0) {
      return Alert.alert("Missing information", "Add a title, category, access code and at least one section.");
    }
    setSaving(true);
    try {
      await saveLesson({
        id, title: title.trim(), level, category: category.trim(), lessonType, sections: valid,
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
      <AppTextField label="Lesson Title" value={title} onChangeText={setTitle} autoCapitalize="words" />
      <Text style={s.l}>Level</Text>
      <View style={s.row}>
        {["Beginner", "Intermediate"].map((x) => <Chip key={x} label={x} selected={level === x} onPress={() => setLevel(x)} />)}
      </View>
      <Text style={s.l}>Category (also the Learning Path topic)</Text>
      <View style={s.row}>
        {CATEGORY_OPTIONS.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}
      </View>
      <AppTextField value={category} onChangeText={setCategory} placeholder="or type a new category" autoCapitalize="words" />
      <Text style={s.l}>Lesson Type</Text>
      <View style={s.row}>
        {["Vocabulary", "Phrase"].map((x) => <Chip key={x} label={x} selected={lessonType === x} onPress={() => setLessonType(x)} />)}
      </View>
      <AppTextField
        label="Access Code (students must enter it)" value={accessCode}
        onChangeText={(t) => setAccessCode(t.toUpperCase())} placeholder="e.g. GREET1" autoCapitalize="characters" />

      <Text style={s.l}>Sections ({sections.length})</Text>
      {sections.map((sec, i) => (
        <AppCard key={i}>
          <View style={s.head}>
            <Text style={s.qn}>Section {i + 1}</Text>
            {sections.length > 1 ? (
              <Pressable onPress={() => setSections(sections.filter((_, k) => k !== i))}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </Pressable>
            ) : null}
          </View>
          <AppTextField label="Dzongkha word / phrase" value={sec.content} onChangeText={(t) => setSection(i, { content: t })} />
          <AppTextField label="English translation" value={sec.translation} onChangeText={(t) => setSection(i, { translation: t })} autoCapitalize="sentences" />
          <AppTextField label="Example sentence (optional)" value={sec.exampleDialogue} onChangeText={(t) => setSection(i, { exampleDialogue: t })} autoCapitalize="sentences" />
        </AppCard>
      ))}
      <AppButton title="+ Add Section" variant="ghost" onPress={() => setSections([...sections, blank()])} style={{ marginBottom: 16 }} />
      <AppButton title={id ? "Save Changes" : "Save Lesson"} onPress={save} loading={saving} />
    </Screen>
  );
}
const s = StyleSheet.create({
  l: { fontWeight: "700", color: colors.text, marginBottom: 8, marginTop: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  head: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  qn: { fontWeight: "700", color: colors.text },
});