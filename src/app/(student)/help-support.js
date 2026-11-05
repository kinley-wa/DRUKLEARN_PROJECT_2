import AppCard from "@/components/ui/AppCard";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const FAQ = [
  ["How do I earn XP?", "Complete lessons (+50), answer quiz questions correctly, finish daily missions, practise vocabulary and do personalized reviews."],
  ["What is the access code?", "Your teacher gives each lesson and quiz a code. Enter it to unlock that content."],
  ["How does my streak work?", "Open and use the app every day. Miss a full day and the streak restarts at 1."],
  ["What are hearts?", "Wrong answers in quizzes and reviews can cost a heart. Hearts come back over time (1 every 30 minutes)."],
  ["How do I reset my password?", "Use 'Forgot Password?' on the login screen."],
];

export default function Help() {
  const [open, setOpen] = useState(null);
  return (
    <Screen hasHeader>
      {FAQ.map(([q, a], i) => (
        <AppCard key={q} onPress={() => setOpen(open === i ? null : i)}>
          <View style={s.row}>
            <Text style={s.q}>{q}</Text>
            <Text style={s.sign}>{open === i ? "−" : "+"}</Text>
          </View>
          {open === i ? <Text style={s.a}>{a}</Text> : null}
        </AppCard>
      ))}
      <Text style={s.foot}>Still need help? Contact your teacher or administrator.</Text>
    </Screen>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  q: { fontWeight: "700", color: colors.text, flex: 1 },
  sign: { fontSize: 20, color: colors.textSecondary },
  a: { color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
  foot: { color: colors.textSecondary, textAlign: "center", marginTop: 12 },
});