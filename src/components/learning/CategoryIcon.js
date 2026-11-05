import { getCategoryStyle } from "@/constants/categories";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function CategoryIcon({ category, size = 48 }) {
  const st = getCategoryStyle(category);
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: st.color + "26", alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={st.icon} size={size * 0.5} color={st.color} />
    </View>
  );
}