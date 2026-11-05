import { getCategoryStyle } from "@/constants/categories";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PathNode({ item, index, onPress }) {
  const st = getCategoryStyle(item.topic.category);
  const bg = item.state === "completed" ? colors.success : item.state === "unlocked" ? colors.gold : "#C9CDD6";
  const icon = item.state === "completed" ? "checkmark" : item.state === "locked" ? "lock-closed" : st.icon;
  const align = index % 2 === 0 ? "flex-start" : "flex-end";
  return (
    <View style={{ alignItems: align, paddingHorizontal: 24 }}>
      <Pressable onPress={onPress} style={s.wrap}>
        <View style={[s.node, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={32} color="#fff" />
        </View>
        <Text style={s.title}>{item.topic.title}</Text>
        <Text style={s.sub}>{item.total === 0 ? "Coming soon" : `${item.done}/${item.total} lessons`}</Text>
      </Pressable>
      <View style={s.line} />
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { alignItems: "center", width: 130 },
  node: {
    width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center",
    borderWidth: 4, borderColor: "#fff", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  title: { fontWeight: "800", color: colors.text, marginTop: 8, textAlign: "center" },
  sub: { color: colors.textSecondary, fontSize: 12 },
  line: { width: 4, height: 28, backgroundColor: "#D9DCE3", marginVertical: 6, alignSelf: "center" },
});