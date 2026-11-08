import { colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function TeacherLayout() {
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
      <Stack.Screen name="lesson-form" options={{ title: "Lesson" }} />
      <Stack.Screen name="quiz-form" options={{ title: "Quiz" }} />
      <Stack.Screen name="quiz-stats" options={{ title: "Quiz Results" }} />
      <Stack.Screen name="competition-form" options={{ title: "Weekly Competition" }} />
      <Stack.Screen name="competition-results" options={{ title: "Challenge Results" }} />
      <Stack.Screen name="topic-form" options={{ title: "Learning Path Topic" }} />
      <Stack.Screen name="vocabulary-form" options={{ title: "Vocabulary" }} />
      <Stack.Screen name="student/[id]" options={{ title: "Student" }} />
    </Stack>
  );
}