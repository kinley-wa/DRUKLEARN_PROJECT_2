import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const icon = (name) => ({ color, size }) => <Ionicons name={name} color={color} size={size} />;

export default function StudentTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: icon("home") }} />
      <Tabs.Screen name="path" options={{ title: "Path", tabBarIcon: icon("map") }} />
      <Tabs.Screen name="practice" options={{ title: "Practice", tabBarIcon: icon("help-circle") }} />
      <Tabs.Screen name="leaderboard" options={{ title: "Ranks", tabBarIcon: icon("trophy") }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: icon("person") }} />
    </Tabs>
  );
}