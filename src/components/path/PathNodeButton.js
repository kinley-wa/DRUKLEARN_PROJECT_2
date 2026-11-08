import ProgressBar from "@/components/ui/ProgressBar";
import { getCategoryStyle } from "@/constants/categories";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

const LABEL_W = 132;
const PALETTE = {
  completed: { top: "#34B36B", base: "#1F8A4E" },
  unlocked: { top: "#F6B54A", base: "#D68F1F" },
  locked: { top: "#B7BDC9", base: "#8D94A3" },
};

export default function PathNodeButton({ item, x, y, side, isCurrent, onPress }) {
  const pal = PALETTE[item.state];
  const icon = item.state === "completed" ? "checkmark" : item.state === "locked" ? "lock-closed" : getCategoryStyle(item.topic.category).icon;
  const pulsing = isCurrent && item.state === "unlocked";

  const pulse = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCurrent) return;
    const loops = [];
    if (pulsing) {
      loops.push(Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true })));
    }
    loops.push(Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 700, useNativeDriver: true }),
    ])));
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isCurrent, pulsing]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  const labelLeft = side === "left" ? x + 38 + 14 : x - 38 - 14 - LABEL_W;
  const pct = item.total ? item.done / item.total : 0;

  return (
    <>
      <Pressable onPress={onPress} style={[s.nodeWrap, { left: x - 50, top: y - 50 }]}>
        {pulsing ? <Animated.View style={[s.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} /> : null}
        <View style={[s.back, { backgroundColor: pal.base }]} />
        <View style={[s.front, { backgroundColor: pal.top }]}>
          <Ionicons name={icon} size={34} color="#fff" />
        </View>
        {item.state === "completed" ? (
          <View style={s.star}><Ionicons name="star" size={15} color="#FFC83D" /></View>
        ) : null}
        {isCurrent ? (
          <Animated.View style={[s.youWrap, { transform: [{ translateY: bobY }] }]}>
            <View style={s.you}><Text style={s.youText}>YOU</Text></View>
            <View style={s.pointer} />
          </Animated.View>
        ) : null}
      </Pressable>

      <Pressable
        onPress={onPress}
        style={[s.label, { left: labelLeft, top: y - 30, borderLeftColor: pal.top, opacity: item.state === "locked" ? 0.8 : 1 }]}
      >
        <Text style={s.title} numberOfLines={2}>{item.topic.title}</Text>
        <Text style={s.sub}>{item.total === 0 ? "Coming soon" : `${item.done}/${item.total} lessons`}</Text>
        {item.total > 0 ? (
          <View style={{ marginTop: 5 }}>
            <ProgressBar value={pct} color={item.state === "completed" ? colors.success : colors.gold} height={5} />
          </View>
        ) : null}
      </Pressable>
    </>
  );
}
const s = StyleSheet.create({
  nodeWrap: { position: "absolute", width: 100, height: 100 },
  ring: { position: "absolute", top: 0, left: 0, width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: "#FFC83D" },
  back: { position: "absolute", top: 18, left: 12, width: 76, height: 76, borderRadius: 38 },
  front: {
    position: "absolute", top: 12, left: 12, width: 76, height: 76, borderRadius: 38,
    borderWidth: 4, borderColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  star: {
    position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  youWrap: { position: "absolute", top: -34, left: 0, right: 0, alignItems: "center" },
  you: { backgroundColor: colors.navy, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  youText: { color: "#fff", fontWeight: "800", fontSize: 11, letterSpacing: 1 },
  pointer: { width: 10, height: 10, backgroundColor: colors.navy, transform: [{ rotate: "45deg" }], marginTop: -5 },
  label: {
    position: "absolute", width: LABEL_W, backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 14,
    paddingVertical: 8, paddingHorizontal: 10, borderLeftWidth: 4,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  title: { fontWeight: "800", color: colors.text, fontSize: 13 },
  sub: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
});