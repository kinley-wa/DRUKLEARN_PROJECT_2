import AppButton from "@/components/ui/AppButton";
import { ONBOARDED_KEY } from "@/constants/storage";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SLIDES = [
  { icon: "earth", color: colors.gold, title: "Welcome to DrukLearn", text: "Learn Dzongkha, the beautiful national language of the Kingdom of Bhutan." },
  { icon: "book", color: colors.blue, title: "Interactive Lessons", text: "Vocabulary, phrases, calligraphy practice and quizzes, with a daily learning path." },
  { icon: "trophy", color: colors.pink, title: "Track Your Progress", text: "Earn XP, complete daily missions, keep your streak and climb the leaderboard." },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const ref = useRef(null);
  const [index, setIndex] = useState(0);

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "1");
    router.replace("/login");
  };
  const next = () => {
    if (index >= SLIDES.length - 1) return finish();
    ref.current?.scrollToIndex({ index: index + 1 });
  };

  return (
    <SafeAreaView style={s.safe}>
      <Text style={s.skip} onPress={finish}>{index < SLIDES.length - 1 ? "Skip" : " "}</Text>
      <FlatList
        ref={ref} data={SLIDES} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        keyExtractor={(x) => x.title}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[s.slide, { width }]}>
            <View style={[s.icon, { backgroundColor: item.color + "26" }]}>
              <Ionicons name={item.icon} size={72} color={item.color} />
            </View>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.text}>{item.text}</Text>
          </View>
        )}
      />
      <View style={s.dots}>
        {SLIDES.map((_, i) => <View key={i} style={[s.dot, i === index && s.dotOn]} />)}
      </View>
      <View style={{ padding: 24 }}>
        <AppButton title={index === SLIDES.length - 1 ? "Get Started" : "Next"} onPress={next} />
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  skip: { alignSelf: "flex-end", padding: 16, color: colors.textSecondary, fontSize: 15 },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  icon: { width: 180, height: 180, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" },
  text: { fontSize: 15, color: colors.textSecondary, textAlign: "center", marginTop: 10, lineHeight: 22 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D5D8DE" },
  dotOn: { width: 22, backgroundColor: colors.gold },
});