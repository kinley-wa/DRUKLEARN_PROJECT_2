import { colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.navy,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="lessons" options={{ title: "Lessons" }} />
      <Stack.Screen name="lesson/[id]" options={{ title: "Lesson" }} />
      <Stack.Screen name="lesson-complete" options={{ title: "Lesson Complete", headerBackVisible: false }} />
      <Stack.Screen name="quiz/[id]" options={{ title: "Quiz" }} />
      <Stack.Screen name="quiz-result" options={{ title: "Quiz Result", headerBackVisible: false }} />
      <Stack.Screen name="competition" options={{ title: "Weekly Challenge" }} />
      <Stack.Screen name="competition-result" options={{ title: "Challenge Result", headerBackVisible: false }} />
      <Stack.Screen name="calligraphy" options={{ title: "Calligraphy Practice" }} />
      <Stack.Screen name="missions" options={{ title: "Daily Missions" }} />
      <Stack.Screen name="vocabulary" options={{ title: "Vocabulary" }} />
      <Stack.Screen name="vocabulary-practice" options={{ title: "Vocabulary Practice" }} />
      <Stack.Screen name="memory-game" options={{ title: "Memory Game" }} />
      <Stack.Screen name="review" options={{ title: "Personalized Review" }} />
      <Stack.Screen name="achievements" options={{ title: "Achievements" }} />
      <Stack.Screen name="my-progress" options={{ title: "My Progress" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="help-support" options={{ title: "Help & Support" }} />
    </Stack>
  );
}