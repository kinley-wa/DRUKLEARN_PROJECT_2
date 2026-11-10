import CategoryIcon from "@/components/learning/CategoryIcon";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import AppTextField from "@/components/ui/AppTextField";
import Chip from "@/components/ui/Chip";
import Screen from "@/components/ui/Screen";
import { CATEGORY_OPTIONS } from "@/constants/categories";
import { colors } from "@/constants/theme";
import { getAllLessons, moveLessonsToCategory } from "@/services/lessonService";
import { getTopic, getTopics, saveTopic } from "@/services/topicService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function TopicForm() {
  const { id, fresh } = useLocalSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [order, setOrder] = useState("1");
  const [savedCategory, setSavedCategory] = useState("");
  const [lessons, setLessons] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showOthers, setShowOthers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [ls, ts] = await Promise.all([getAllLessons(), getTopics()]);
      setLessons(ls); setTopics(ts);
      return ts;
    } catch (e) { return []; }
  }, []);

  // load the topic being edited, or suggest the next order number for a new one
  useEffect(() => {
    (async () => {
      const ts = await refresh();
      if (id) {
        const t = await getTopic(id);
        if (t) { setTitle(t.title); setCategory(t.category); setOrder(String(t.order)); setSavedCategory(t.category); }
      } else {
        setOrder(String(ts.reduce((m, t) => Math.max(m, t.order || 0), 0) + 1));
      }
    })();
  }, [id]);

  useEffect(() => { if (fresh) setNotice("Topic saved! Now add lessons to it below."); }, [fresh]);

  // coming back from the lesson form: reload so the new lesson shows up
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const save = async () => {
    const t = title.trim();
    const c = category.trim();
    if (!t || !c) return Alert.alert("Missing information", "Add a title and a category.");
    const clash = topics.find((x) => x.id !== id && (x.category || "").trim().toLowerCase() === c.toLowerCase());
    if (clash) {
      return Alert.alert("Category already used", `The topic "${clash.title}" already uses the category "${c}". Each topic needs its own category.`);
    }
    setSaving(true);
    try {
      // if the category changed, its lessons move along with it
      if (id && savedCategory && savedCategory !== c) {
        const toMove = lessons.filter((l) => l.category === savedCategory).map((l) => l.id);
        if (toMove.length) await moveLessonsToCategory(toMove, c);
      }
      const newId = await saveTopic({ id, title: t, category: c, order: parseInt(order, 10) || 1 });
      if (id) {
        setSavedCategory(c);
        await refresh();
        setNotice("Saved ✓");
      } else {
        router.replace({ pathname: "/topic-form", params: { id: newId, fresh: "1" } });
      }
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally { setSaving(false); }
  };

  const moveIn = (l) => {
    Alert.alert(
      "Move lesson?",
      `"${l.title}" is in "${l.category || "no category"}". Moving it here changes its category to "${savedCategory}" and takes it out of its current topic.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Move",
          onPress: async () => {
            try {
              await moveLessonsToCategory([l.id], savedCategory);
              await refresh();
              setNotice(`Moved "${l.title}" into this topic.`);
            } catch (e) { Alert.alert("Couldn't move", e.message); }
          },
        },
      ]
    );
  };

  const inTopic = id && savedCategory ? lessons.filter((l) => l.category === savedCategory) : [];
  const others = id && savedCategory ? lessons.filter((l) => l.category !== savedCategory) : [];

  return (
    <Screen hasHeader>
      <Text style={s.hint}>
        A topic is one stop on the student's Learning Path. It contains every lesson that has the same category.
      </Text>
      {notice ? (
        <View style={s.notice}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={s.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <AppTextField label="Topic title" value={title} onChangeText={setTitle} autoCapitalize="words" />
      <Text style={s.l}>Category</Text>
      <View style={s.row}>
        {CATEGORY_OPTIONS.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}
      </View>
      <AppTextField value={category} onChangeText={setCategory} placeholder="or type a category" autoCapitalize="words" />
      <AppTextField label="Order (1 = first)" value={order} onChangeText={(t) => setOrder(t.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
      <AppButton title={id ? "Save Changes" : "Save Topic & Add Lessons"} onPress={save} loading={saving} />

      {id && savedCategory ? (
        <>
          <Text style={s.h}>Lessons in this topic ({inTopic.length})</Text>
          {inTopic.length === 0 ? (
            <Text style={s.note}>No lessons yet. Students see this topic as "Coming soon" until it has one.</Text>
          ) : inTopic.map((l) => (
            <AppCard key={l.id} onPress={() => router.push({ pathname: "/lesson-form", params: { id: l.id } })}>
              <View style={s.lessonRow}>
                <CategoryIcon category={l.category} size={42} />
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text style={s.lt} numberOfLines={1}>{l.title || "Untitled"}</Text>
                  <Text style={s.note}>{l.sections.length} sections • {l.level} • code {l.accessCode || "-"}</Text>
                </View>
                <Ionicons name="pencil" size={18} color={colors.goldDark} />
              </View>
            </AppCard>
          ))}

          <AppButton
            title="+ Add a new lesson to this topic"
            onPress={() => router.push({ pathname: "/lesson-form", params: { category: savedCategory } })}
            style={{ marginTop: 4 }} />

          {others.length > 0 ? (
            <>
              <Pressable onPress={() => setShowOthers(!showOthers)} style={s.toggle}>
                <Text style={s.toggleText}>{showOthers ? "Hide" : "Add an existing lesson"} ({others.length} available)</Text>
                <Ionicons name={showOthers ? "chevron-up" : "chevron-down"} size={18} color={colors.blue} />
              </Pressable>
              {showOthers ? others.map((l) => (
                <AppCard key={l.id}>
                  <View style={s.lessonRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.lt} numberOfLines={1}>{l.title || "Untitled"}</Text>
                      <Text style={s.note}>Now in: {l.category || "no category"}</Text>
                    </View>
                    <Pressable onPress={() => moveIn(l)} style={s.moveBtn}>
                      <Text style={s.moveText}>Move here</Text>
                    </Pressable>
                  </View>
                </AppCard>
              )) : null}
            </>
          ) : null}

          <AppButton title="Done" variant="ghost" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </>
      ) : (
        <Text style={[s.note, { marginTop: 14 }]}>After you save the topic you can add lessons to it.</Text>
      )}
    </Screen>
  );
}
const s = StyleSheet.create({
  hint: { color: colors.textSecondary, marginBottom: 14 },
  notice: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.success + "1A", borderRadius: 12, padding: 12, marginBottom: 14 },
  noticeText: { color: colors.success, fontWeight: "700", flex: 1 },
  l: { fontWeight: "700", color: colors.text, marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  h: { fontSize: 17, fontWeight: "800", color: colors.text, marginTop: 24, marginBottom: 10 },
  note: { color: colors.textSecondary, fontSize: 12 },
  lessonRow: { flexDirection: "row", alignItems: "center" },
  lt: { fontWeight: "700", color: colors.text },
  toggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  toggleText: { color: colors.blue, fontWeight: "700" },
  moveBtn: { backgroundColor: colors.gold + "33", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  moveText: { color: colors.goldDark, fontWeight: "800", fontSize: 12 },
});