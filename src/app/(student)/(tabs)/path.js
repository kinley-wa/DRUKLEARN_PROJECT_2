import PathNode from "@/components/learning/PathNode";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useStudentData } from "@/hooks/useStudentData";
import { buildPath, getTopics } from "@/services/topicService";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text } from "react-native";

export default function PathScreen() {
  const router = useRouter();
  const { loading, error, lessons, progressMap, reload } = useStudentData();
  const [topics, setTopics] = useState([]);
  useFocusEffect(useCallback(() => { getTopics().then(setTopics).catch(() => {}); }, []));

  const items = buildPath(topics, lessons, progressMap);
  return (
    <Screen title="Learning Path" onRefresh={reload} refreshing={loading}>
      <Text style={{ color: colors.textSecondary, marginBottom: 20 }}>Finish each topic to unlock the next one.</Text>
      {loading && !lessons.length ? <LoadingView /> : error ? <ErrorState message={error} onRetry={reload} /> :
        items.length === 0 ? (
          <EmptyState icon="map-outline" title="No topics yet" message="Your teacher hasn't added lessons yet." />
        ) : items.map((it, i) => (
          <PathNode
            key={it.topic.id} item={it} index={i}
            onPress={() => {
              if (it.state === "locked") {
                return Alert.alert("Locked", it.total === 0 ? "This topic has no lessons yet." : "Complete the previous topic first.");
              }
              router.push({ pathname: "/lessons", params: { category: it.topic.category } });
            }} />
        ))}
    </Screen>
  );
}