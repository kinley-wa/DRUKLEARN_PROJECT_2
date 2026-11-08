import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

export default function MemoryCard({ card, faceUp, matched, width, height, onPress }) {
  const revealed = faceUp || matched;
  const flip = useRef(new Animated.Value(revealed ? 1 : 0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  // flip animation: 0 = face down, 1 = face up
  useEffect(() => {
    Animated.timing(flip, { toValue: revealed ? 1 : 0, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
  }, [revealed]);

  // a small "pop" once a pair is matched, after the flip has finished
  useEffect(() => {
    if (!matched) return;
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(pop, { toValue: 1.08, duration: 140, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [matched]);

  // The card turns 180 degrees. The faces swap exactly halfway, when the card is edge-on and invisible.
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const backOpacity = flip.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const frontOpacity = flip.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const wordSize = Math.max(13, Math.min(24, width * 0.28));
  const meaningSize = Math.max(11, Math.min(17, width * 0.19));
  const isWord = card.kind === "word";

  return (
    <Pressable onPress={onPress} disabled={matched} style={{ width, height }}>
      <Animated.View style={{ width, height, transform: [{ scale: pop }] }}>
        <Animated.View style={[s.face, s.back, { opacity: backOpacity, transform: [{ perspective: 900 }, { rotateY: backRotate }] }]}>
          <Ionicons name="help" size={Math.min(width, height) * 0.45} color={colors.gold} />
        </Animated.View>

        <Animated.View
          style={[
            s.face,
            isWord ? s.word : s.meaning,
            matched && s.matched,
            { opacity: frontOpacity, transform: [{ perspective: 900 }, { rotateY: frontRotate }] },
          ]}
        >
          <Text
            allowFontScaling={false}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            numberOfLines={isWord ? 2 : 3}
            style={[s.text, { fontSize: isWord ? wordSize : meaningSize, fontWeight: isWord ? "800" : "700" }]}
          >
            {card.text}
          </Text>
          {matched ? (
            <View style={s.check}><Ionicons name="checkmark" size={12} color="#fff" /></View>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
const s = StyleSheet.create({
  face: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center", padding: 6,
  },
  back: { backgroundColor: colors.navy, borderColor: colors.gold },
  word: { backgroundColor: "#FFF6E3", borderColor: colors.gold },
  meaning: { backgroundColor: "#EAF1F9", borderColor: colors.blue },
  matched: { backgroundColor: "#E7F6EC", borderColor: colors.success },
  text: { color: colors.navy, textAlign: "center" },
  check: {
    position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.success, alignItems: "center", justifyContent: "center",
  },
});