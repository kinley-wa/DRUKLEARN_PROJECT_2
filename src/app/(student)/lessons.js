import CategoryIcon from "@/components/learning/CategoryIcon";
import AppCard from "@/components/ui/AppCard";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingView from "@/components/ui/LoadingView";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useStudentData } from "@/hooks/useStudentData";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const LEVELS = ["All", "Beginner", "Intermediate"];

export default function Lessons() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { loading, error, lessons, progressMap, reload } = useStudentData();
  const [level, setLevel] = useState("All");
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const list = lessons
    .filter((l) => level === "All" || l.level === level)
    .filter((l) => !category || l.category === category)
    .filter((l) => !q || l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q));

  return (
    <Screen hasHeader>
      {category ? <Text style={s.cat}>Topic: {category}</Text> : null}
      <View style={s.search}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={search} onChangeText={setSearch} placeholder="Search lessons by name or category"
          placeholderTextColor={colors.textSecondary} style={s.input} />
      </View>
      <View style={s.chips}>
        {LEVELS.map((l) => <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(l)} />)}
      </View>

      {loading && !lessons.length ? <LoadingView /> : error ? <ErrorState message={error} onRetry={reload} /> :
        list.length === 0 ? (
          <EmptyState title={q ? `No lessons match "${search}"` : "No lessons yet"} message="Your teacher hasn't added matching lessons yet." />
        ) : list.map((l) => {
          const pct = progressMap[l.id] ? progressMap[l.id].percent : 0;
          return (
            <AppCard key={l.id} onPress={() => router.push(`/lesson/${l.id}`)}>
              <View style={s.row}>
                <CategoryIcon category={l.category} />
                <View style={{ flex: 1, marginHorizontal: 14 }}>
                  <Text style={s.title}>{l.title}</Text>
                  <Text style={s.sub}>{l.sections.length} sections • {l.level}</Text>
                  <View style={{ marginTop: 8 }}><ProgressBar value={pct / 100} color={colors.success} height={6} /></View>
                  <Text style={s.sub}>{pct}%</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </AppCard>
          );
        })}
    </Screen>
  );
}
const s = StyleSheet.create({
  cat: { color: colors.goldDark, fontWeight: "700", marginBottom: 10 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 12, marginBottom: 12 },
  input: { flex: 1, paddingVertical: 12, color: colors.text },
  chips: { flexDirection: "row", gap: 8, marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});