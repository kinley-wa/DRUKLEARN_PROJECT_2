import { colors } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const LOGO = require("../../../assets/images/logo.png");
const TITLE = "DrukLearn".split("");
const FLAGS = ["#3C7BD9", "#FFFFFF", "#E0483E", "#3FA860", "#F2C230"];

export default function AnimatedSplash() {
  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const letters = useRef(TITLE.map(() => new Animated.Value(0))).current;
  const line = useRef(new Animated.Value(0)).current;
  const tag1 = useRef(new Animated.Value(0)).current;
  const tag2 = useRef(new Animated.Value(0)).current;
  const flags = useRef(FLAGS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const ringLoop = Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true })
    );
    ringLoop.start();

    const intro = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.stagger(
        55,
        letters.map((v) =>
          Animated.timing(v, { toValue: 1, duration: 300, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true })
        )
      ),
      Animated.timing(line, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.stagger(200, [tag1, tag2].map((v) => Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: true }))),
      Animated.stagger(70, flags.map((v) => Animated.spring(v, { toValue: 1, friction: 4, useNativeDriver: true }))),
    ]);
    intro.start();

    return () => { ringLoop.stop(); intro.stop(); };
  }, []);

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const rise = (v, from) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
  });

  return (
    <View style={s.c}>
      <View style={[s.bg, s.bgTop]} />
      <View style={[s.bg, s.bgBottom]} />

      <View style={s.logoBox}>
        <Animated.View style={[s.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
        <Animated.Image
          source={LOGO}
          style={[s.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        />
      </View>

      <View style={s.titleRow}>
        {TITLE.map((ch, i) => (
          <Animated.Text key={i} style={[s.title, rise(letters[i], 22)]}>{ch}</Animated.Text>
        ))}
      </View>

      <Animated.View style={[s.line, { transform: [{ scaleX: line }] }]} />

      <Animated.Text style={[s.tag, rise(tag1, 14)]}>LEARN DZONGKHA,</Animated.Text>
      <Animated.Text style={[s.tag, s.tagGold, rise(tag2, 14)]}>LEARN BHUTAN</Animated.Text>

      <View style={s.flags}>
        {FLAGS.map((c, i) => (
          <Animated.View key={i} style={[s.flag, { backgroundColor: c, opacity: flags[i], transform: [{ scale: flags[i] }] }]} />
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center" },
  bg: { position: "absolute", borderRadius: 999, backgroundColor: colors.navyLight },
  bgTop: { width: 360, height: 360, top: -140, right: -120 },
  bgBottom: { width: 300, height: 300, bottom: -120, left: -100 },
  logoBox: { width: 150, height: 150, alignItems: "center", justifyContent: "center", marginBottom: 26 },
  ring: { position: "absolute", width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: colors.gold },
  logo: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: colors.gold },
  titleRow: { flexDirection: "row" },
  title: { color: "#fff", fontSize: 42, fontWeight: "800", letterSpacing: 1 },
  line: { width: 90, height: 3, borderRadius: 2, backgroundColor: colors.gold, marginVertical: 14 },
  tag: { color: "#E7EAF3", fontSize: 14, fontWeight: "700", letterSpacing: 3, marginTop: 2 },
  tagGold: { color: colors.gold },
  flags: { flexDirection: "row", gap: 8, marginTop: 28 },
  flag: { width: 12, height: 12, borderRadius: 6 },
});