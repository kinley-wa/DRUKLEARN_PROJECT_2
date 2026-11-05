import { colors } from "@/constants/theme";
import { ActivityIndicator, View } from "react-native";

export default function LoadingView() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
      <ActivityIndicator size="large" color={colors.gold} />
    </View>
  );
}