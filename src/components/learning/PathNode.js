import { getCategoryStyle } from "@/constants/categories";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

const NODE = 84;
const WRAP = 140;
const PAD = 32;
const TRAIL_H = 76;
const DOTS = 6;

const GRADIENTS = {
  completed: ["#5ED79A", "#2E9E5B"],
  unlocked: ["#FFC85C", "#E8A13A"],
  locked: ["#D8DBE3", "#B9BDC9"],
};

const smooth = (t) => t * t * (3 - 2 * t); // S-curve easing

export default function PathNode({ item, index, onPress, isLast = false }) {
  const { width: screenW } = useWindowDimensions();
  const [W, setW] = useState(screenW);

  const state = item.state; // "completed" | "unlocked" | "locked"
  const st = getCategoryStyle(item.topic.category);
  const icon =
    state === "completed" ? "checkmark" : state === "locked" ? "lock-closed" : st.icon;

  const isLeft = index % 2 === 0;
  const total = item.total ?? 0;
  const pct = total > 0 ? Math.min(1, item.done / total) : 0;

  // ---- animations ----
  const pulse = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== "unlocked") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  const pressIn = () =>
    Animated.spring(press, { toValue: 0.92, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () =>
    Animated.spring(press, { toValue: 1, useNativeDriver: true, friction: 4 }).start();

  // ---- trail geometry (curves toward the next node) ----
  const leftX = PAD + WRAP / 2;
  const rightX = W - PAD - WRAP / 2;
  const fromX = isLeft ? leftX : rightX;
  const toX = isLeft ? rightX : leftX;

  const dots = Array.from({ length: DOTS }, (_, i) => {
    const t = (i + 1) / (DOTS + 1);
    return {
      x: fromX + (toX - fromX) * smooth(t),
      y: t * TRAIL_H,
      size: 7 + Math.sin(t * Math.PI) * 2,
    };
  });
  const trailColor = state === "completed" ? "#7BDCA5" : "#D5D9E2";

  const glow = state === "completed" ? "#2E9E5B" : state === "unlocked" ? "#E8A13A" : "#9AA0AE";

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <View style={{ alignItems: isLeft ? "flex-start" : "flex-end", paddingHorizontal: PAD }}>
        <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={s.wrap}>
          <Animated.View style={{ transform: [{ scale: press }], alignItems: "center" }}>
            {/* node */}
            <View style={s.nodeArea}>
              {state === "unlocked" && (
                <Animated.View
                  style={[
                    s.pulse,
                    {
                      backgroundColor: glow,
                      opacity: pulseOpacity,
                      transform: [{ scale: pulseScale }],
                    },
                  ]}
                />
              )}

              <View style={[s.ring, { shadowColor: glow }]}>
                <LinearGradient
                  colors={GRADIENTS[state] || GRADIENTS.locked}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={s.node}
                >
                  {/* soft top highlight */}
                  <View style={s.shine} />
                  <Ionicons name={icon} size={state === "completed" ? 40 : 34} color="#fff" />
                </LinearGradient>
              </View>

              {state === "unlocked" && (
                <View style={s.startTag}>
                  <Text style={s.startText}>START</Text>
                </View>
              )}

              {state === "completed" && (
                <View style={s.star}>
                  <Ionicons name="star" size={13} color="#E8A13A" />
                </View>
              )}
            </View>

            {/* label */}
            <Text
              style={[s.title, state === "locked" && { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.topic.title}
            </Text>

            {total === 0 ? (
              <View style={s.soon}>
                <Text style={s.soonText}>Coming soon</Text>
              </View>
            ) : (
              <View style={s.progressWrap}>
                <View style={s.track}>
                  <View
                    style={[
                      s.fill,
                      {
                        width: `${pct * 100}%`,
                        backgroundColor: state === "completed" ? "#2E9E5B" : "#E8A13A",
                      },
                    ]}
                  />
                </View>
                <Text style={s.sub}>
                  {item.done}/{total}
                </Text>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </View>

      {/* dotted S-curve trail to the next node */}
      {!isLast && (
        <View style={{ height: TRAIL_H }} pointerEvents="none">
          {dots.map((d, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: d.x - d.size / 2,
                top: d.y - d.size / 2,
                width: d.size,
                height: d.size,
                borderRadius: d.size / 2,
                backgroundColor: trailColor,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: WRAP, alignItems: "center" },
  nodeArea: {
    width: NODE + 20,
    height: NODE + 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
  },
  ring: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 4,
    borderColor: "#fff",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  node: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  shine: {
    position: "absolute",
    top: 5,
    left: 12,
    right: 12,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  startTag: {
    position: "absolute",
    bottom: 2,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  startText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#E8A13A",
  },
  star: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontWeight: "800",
    fontSize: 15,
    color: colors.text,
    marginTop: 4,
    textAlign: "center",
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  track: {
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E4E7EE",
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3 },
  sub: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  soon: {
    marginTop: 6,
    backgroundColor: "#ECEEF3",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  soonText: { color: colors.textSecondary, fontSize: 11, fontWeight: "600" },
});