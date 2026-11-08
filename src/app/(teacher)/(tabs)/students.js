import TeacherScreen from "@/components/teacher/TeacherScreen";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ProgressBar from "@/components/ui/ProgressBar";
import { colors } from "@/constants/theme";
import { getAllLessons } from "@/services/lessonService";
import {
  buildClassReport, completedByUser, getAllProgress, lastActiveLabel, studentStatus,
} from "@/services/teacherService";
import { getAllStudents } from "@/services/userService";
import { getLevelInfo } from "@/utils/level";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Share, StyleSheet, Text, TextInput, View } from "react-native";

const FILTERS = [["all", "All"], ["active", "Active"], ["inactive", "Inactive"], ["notstarted", "Not started"]];
const SORTS = [["xp", "Top XP"], ["name", "A-Z"], ["streak", "Streak"], ["stale", "Least active"]];
const STATUS = {
  active: { label: "Active", color: colors.success },
  inactive: { label: "Inactive 3+ days", color: colors.amber },
  notstarted: { label: "Not started", color: colors.textSecondary },
};

function sortStudents(list, sort) {
  const l = [...list];
  if (sort === "name") l.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
  else if (sort === "streak") l.sort((a, b) => b.streak - a.streak);
  else if (sort === "stale") l.sort((a, b) => (a.lastActiveDate || "").localeCompare(b.lastActiveDate || ""));
  else l.sort((a, b) => b.xp - a.xp);
  return l;
}

export default function Students() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [doneMap, setDoneMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("xp");

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [st, ls, pr] = await Promise.all([getAllStudents(), getAllLessons(), getAllProgress()]);
      setStudents(st);
      setLessonsCount(ls.length);
      setDoneMap(completedByUser(pr, ls.map((l) => l.id)));
    } catch (e) {
      setError(true);
    } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const counts = useMemo(() => {
    const c = { active: 0, inactive: 0, notstarted: 0 };
    students.forEach((x) => { c[studentStatus(x)] += 1; });
    return c;
  }, [students]);
  const avgXp = students.length ? Math.round(students.reduce((a, x) => a + x.xp, 0) / students.length) : 0;

  const q = search.trim().toLowerCase();
  const shown = sortStudents(
    students
      .filter((x) => filter === "all" || studentStatus(x) === filter)
      .filter((x) => !q || (x.fullName || "").toLowerCase().includes(q) || (x.email || "").toLowerCase().includes(q)),
    sort
  );

  const share = async () => {
    try { await Share.share({ message: buildClassReport({ students, lessonsCount, doneMap }) }); }
    catch (e) { Alert.alert("Couldn't share", e.message); }
  };

  return (
    <TeacherScreen
      title="Students" subtitle="Track who is learning and who needs a nudge."
      stats={[
        { icon: "people", value: students.length, label: "Registered", color: colors.gold },
        { icon: "flash", value: counts.active, label: "Active", color: colors.green },
        { icon: "alert-circle", value: counts.inactive + counts.notstarted, label: "Need a nudge", color: colors.amber },
        { icon: "star", value: avgXp, label: "Avg XP", color: colors.pink },
      ]}
      onRefresh={load} refreshing={loading}
    >
      {error ? <ErrorState onRetry={load} /> : (
        <>
          <View style={s.search}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput value={search} onChangeText={setSearch} placeholder="Search by name or email" placeholderTextColor={colors.textSecondary} style={s.searchInput} />
          </View>
          <View style={s.chips}>{FILTERS.map(([k, label]) => <Chip key={k} label={label} selected={filter === k} onPress={() => setFilter(k)} />)}</View>
          <Text style={s.small}>Sort by</Text>
          <View style={s.chips}>{SORTS.map(([k, label]) => <Chip key={k} label={label} color={colors.blue} selected={sort === k} onPress={() => setSort(k)} />)}</View>

          {students.length > 0 ? (
            <AppButton title="Share class report" icon="share-outline" variant="ghost" onPress={share} style={{ marginBottom: 14 }} />
          ) : null}

          {students.length === 0 && !loading ? (
            <EmptyState icon="people-outline" title="No students yet" message="Students appear here after they register." />
          ) : shown.length === 0 && !loading ? (
            <EmptyState icon="search-outline" title="No students match" message="Try a different search or filter." />
          ) : shown.map((u) => {
            const st = studentStatus(u);
            const meta = STATUS[st];
            const done = doneMap[u.uid] || 0;
            return (
              <AppCard key={u.uid} onPress={() => router.push(`/student/${u.uid}`)}>
                <View style={s.row}>
                  <View style={[s.avatar, st === "notstarted" && { backgroundColor: "#BFC3CC" }]}>
                    <Text style={s.av}>{(u.fullName || "?").slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={s.name} numberOfLines={1}>{u.fullName || "Unnamed"}</Text>
                    <Text style={s.email} numberOfLines={1}>{u.email}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.xp}>{u.xp} XP</Text>
                    <Text style={s.email}>Level {getLevelInfo(u.xp).level}</Text>
                  </View>
                </View>
                <View style={{ marginTop: 12 }}>
                  <ProgressBar value={lessonsCount ? done / lessonsCount : 0} color={colors.success} height={6} />
                </View>
                <View style={s.metaRow}>
                  <Text style={s.email}>{done}/{lessonsCount} lessons • 🔥 {u.streak}d • opened {lastActiveLabel(u.lastActiveDate)}</Text>
                </View>
                <View style={[s.status, { backgroundColor: meta.color + "22" }]}>
                  <Text style={[s.statusText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </AppCard>
            );
          })}
        </>
      )}
    </TeacherScreen>
  );
}
const s = StyleSheet.create({
  search: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 11, color: colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  small: { color: colors.textSecondary, fontSize: 12, fontWeight: "700", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center" },
  av: { color: "#fff", fontWeight: "800" },
  name: { fontWeight: "800", color: colors.text, fontSize: 15 },
  email: { color: colors.textSecondary, fontSize: 12 },
  xp: { fontWeight: "800", color: colors.goldDark },
  metaRow: { marginTop: 8 },
  status: { alignSelf: "flex-start", marginTop: 8, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontWeight: "800", fontSize: 11 },
});