import AppButton from "@/components/ui/AppButton";
import AppTextField from "@/components/ui/AppTextField";
import Chip from "@/components/ui/Chip";
import Screen from "@/components/ui/Screen";
import { CATEGORY_OPTIONS } from "@/constants/categories";
import { colors } from "@/constants/theme";
import { getTopic, saveTopic } from "@/services/topicService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function TopicForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [order, setOrder] = useState("1");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) getTopic(id).then((t) => { if (t) { setTitle(t.title); setCategory(t.category); setOrder(String(t.order)); } });
  }, [id]);

  const save = async () => {
    if (!title.trim() || !category.trim()) return Alert.alert("Missing information", "Add a title and category.");
    setSaving(true);
    try {
      await saveTopic({ id, title: title.trim(), category: category.trim(), order: parseInt(order, 10) || 1 });
      router.back();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally { setSaving(false); }
  };

  return (
    <Screen hasHeader>
      <Text style={s.hint}>A topic groups all lessons that share its category. Lower order numbers come first on the path.</Text>
      <AppTextField label="Topic title" value={title} onChangeText={setTitle} autoCapitalize="words" />
      <Text style={s.l}>Category</Text>
      <View style={s.row}>
        {CATEGORY_OPTIONS.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}
      </View>
      <AppTextField value={category} onChangeText={setCategory} placeholder="or type a category" autoCapitalize="words" />
      <AppTextField label="Order (1 = first)" value={order} onChangeText={(t) => setOrder(t.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
      <AppButton title={id ? "Save Changes" : "Save Topic"} onPress={save} loading={saving} />
    </Screen>
  );
}
const s = StyleSheet.create({
  hint: { color: colors.textSecondary, marginBottom: 14 },
  l: { fontWeight: "700", color: colors.text, marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
});