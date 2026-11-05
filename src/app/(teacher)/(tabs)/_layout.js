import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const icon = (name) => ({ color, size }) => <Ionicons name={name} color={color} size={size} />;

export default function TeacherTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: icon("grid") }} />
      <Tabs.Screen name="students" options={{ title: "Students", tabBarIcon: icon("people") }} />
      <Tabs.Screen name="teacher-profile" options={{ title: "Profile", tabBarIcon: icon("person") }} />
    </Tabs>
  );
}