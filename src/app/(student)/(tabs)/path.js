import PathNodeButton from "@/components/path/PathNodeButton";
import RoadScene from "@/components/path/RoadScene";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingView from "@/components/ui/LoadingView";
import { colors } from "@/constants/theme";
import { useStudentData } from "@/hooks/useStudentData";
import { buildPath, getTopics } from "@/services/topicService";
import { computeLayout } from "@/utils/pathGeometry";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Legend({ color, text }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={s.legendText}>{text}</Text>
    </View>
  );
}

export default function PathScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { loading, error, lessons, progressMap, reload } = useStudentData();
  const [topics, setTopics] = useState([]);
  const [viewH, setViewH] = useState(0);
  const scrollRef = useRef(null);
  const scrolled = useRef(false);

  useFocusEffect(useCallback(() => { getTopics().then(setTopics).catch(() => {}); }, []));

  const items = buildPath(topics, lessons, progressMap);
  const layout = useMemo(() => computeLayout(width, items.length), [width, items.length]);

  // where the student is: the first unlocked topic, otherwise the last completed one
  const currentIndex = items.findIndex((i) => i.state === "unlocked");
  let lastCompleted = -1;
  items.forEach((it, i) => { if (it.state === "completed") lastCompleted = i; });
  const reached = currentIndex >= 0 ? currentIndex : lastCompleted;
  const allDone = items.length > 0 && items.every((i) => i.state === "completed");
  const doneUntil = allDone ? layout.points.length - 1 : reached >= 0 ? reached + 1 : 0;

  // scroll to the student's position once, when the screen first opens
  useEffect(() => {
    if (scrolled.current || !viewH || items.length === 0) return;
    const node = layout.nodes[reached >= 0 ? reached : 0];
    if (!node) return;
    scrolled.current = true;
    setTimeout(() => scrollRef.current && scrollRef.current.scrollTo({ y: Math.max(0, node.y - viewH * 0.55), animated: false }), 50);
  }, [viewH, items.length]);

  const open = (it) => {
    if (it.state === "locked") {
      return Alert.alert("Locked", it.total === 0 ? "This topic has no lessons yet." : "Complete the previous topic first.");
    }
    router.push({ pathname: "/lessons", params: { category: it.topic.category } });
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>Learning Path</Text>
        <Text style={s.sub}>Follow the road to the dzong. Finish each topic to unlock the next.</Text>
        <View style={s.legend}>
          <Legend color="#34B36B" text="Done" />
          <Legend color="#F6B54A" text="Current" />
          <Legend color="#B7BDC9" text="Locked" />
        </View>
      </View>

      {loading && !lessons.length ? <LoadingView /> : error ? <ErrorState message={error} onRetry={reload} /> :
        items.length === 0 ? (
          <EmptyState icon="map-outline" title="No topics yet" message="Your teacher hasn't added lessons yet." />
        ) : (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            onLayout={(e) => setViewH(e.nativeEvent.layout.height)}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
          >
            <View style={{ width, height: layout.height }}>
              <RoadScene width={width} height={layout.height} points={layout.points} doneUntil={doneUntil} />

              <View style={[s.signWrap, { left: width * 0.5 + 58, top: layout.height - 130 }]}>
                <View style={s.signBoard}><Text style={s.signText}>START</Text></View>
                <View style={s.signPost} />
              </View>

              {items.map((it, i) => (
                <PathNodeButton
                  key={it.topic.id}
                  item={it}
                  x={layout.nodes[i].x}
                  y={layout.nodes[i].y}
                  side={layout.nodes[i].x < width / 2 ? "left" : "right"}
                  isCurrent={i === reached}
                  onPress={() => open(it)}
                />
              ))}
            </View>
          </ScrollView>
        )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E2F3FF" },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  sub: { color: colors.textSecondary, marginTop: 2, fontSize: 12 },
  legend: { flexDirection: "row", gap: 16, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.textSecondary, fontWeight: "600" },
  signWrap: { position: "absolute", alignItems: "center" },
  signBoard: { backgroundColor: "#8A5A33", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 2, borderColor: "#6B4426" },
  signText: { color: "#fff", fontWeight: "900", letterSpacing: 2, fontSize: 12 },
  signPost: { width: 6, height: 34, backgroundColor: "#6B4426" },
});