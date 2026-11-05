import QuestionRunner from "@/components/learning/QuestionRunner";
import AccessCodeModal from "@/components/ui/AccessCodeModal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import { getCompetition, hasAttempted, submitCompetition } from "@/services/competitionService";
import { isUnlocked, markUnlocked } from "@/utils/unlocked";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function Competition() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const c = await getCompetition();
      setComp(c);
      if (c && user) {
        setAttempted(await hasAttempted(user.uid, c));
        setUnlocked(!c.accessCode || isUnlocked(`comp:${c.publishedAt}`));
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading || saving) return <Screen hasHeader><LoadingView /></Screen>;
  if (!comp) {
    return (
      <Screen hasHeader>
        <EmptyState icon="trophy-outline" title="No active competition"
          message="Check back soon, your teacher hasn't published this week's challenge yet."
          actionLabel="Back" onAction={() => router.back()} />
      </Screen>
    );
  }
  if (attempted) {
    return (
      <Screen hasHeader>
        <EmptyState icon="checkmark-circle-outline" title="Already completed"
          message="You've taken this challenge. See how you ranked."
          actionLabel="View Results" onAction={() => router.replace("/competition-result")} />
      </Screen>
    );
  }
  if (!unlocked) {
    return (
      <Screen hasHeader>
        <AccessCodeModal
          visible title={comp.title} correctCode={comp.accessCode}
          onCancel={() => router.back()}
          onCorrect={() => { markUnlocked(`comp:${comp.publishedAt}`); setUnlocked(true); }} />
      </Screen>
    );
  }

  return (
    <Screen hasHeader>
      <QuestionRunner
        questions={comp.questions}
        timeLimitSeconds={comp.timeLimitMinutes * 60}
        onFinish={async (score) => {
          if (!user) return;
          setSaving(true);
          try {
            await submitCompetition({ uid: user.uid, userName: profile ? profile.fullName : "", comp, score });
          } finally {
            router.replace("/competition-result");
          }
        }} />
    </Screen>
  );
}