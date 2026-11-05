import MissionCard from "@/components/learning/MissionCard";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getTodayMissions } from "@/services/missionService";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text } from "react-native";

export default function Missions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [defs, setDefs] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const r = await getTodayMissions(user.uid);
      setData(r.data); setDefs(r.defs);
    } finally { setLoading(false); }
  }, [user]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading && !data) return <Screen hasHeader><LoadingView /></Screen>;
  return (
    <Screen hasHeader onRefresh={load} refreshing={loading}>
      <Text style={{ color: colors.textSecondary, marginBottom: 14 }}>
        New missions arrive every day. XP is awarded as soon as you finish one.
      </Text>
      {defs.map((m) => (
        <MissionCard key={m.id} mission={m} progress={data && data.progress[m.id] ? data.progress[m.id] : 0} done={!!(data && data.claimed[m.id])} />
      ))}
    </Screen>
  );
}