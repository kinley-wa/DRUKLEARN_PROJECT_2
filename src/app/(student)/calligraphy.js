import DrawingCanvas from "@/components/calligraphy/DrawingCanvas";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import { CALLIGRAPHY_CHARS } from "@/constants/calligraphyChars";
import { colors } from "@/constants/theme";
import { scoreTracing } from "@/utils/scoring";
import { Ionicons } from "@expo/vector-icons";
import { useFont } from "@shopify/react-native-skia";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Calligraphy() {
  const [index, setIndex] = useState(0);
  const [strokes, setStrokes] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [score, setScore] = useState(null);
  const [unavailable, setUnavailable] = useState(false);

  const ch = CALLIGRAPHY_CHARS[index % CALLIGRAPHY_CHARS.length];
  const strokeWidth = Math.max(10, size.w * 0.04);
  // path: src/app/(student)/ -> up three levels is the project root
  const font = useFont(require("../../../assets/fonts/TibetanFont.ttf"), Math.max(60, size.h * 0.65));

  const check = () => {
    if (!font || strokes.length === 0) return;
    const result = scoreTracing({ glyph: ch.glyph, font, strokes, width: size.w, height: size.h, strokeWidth });
    if (result === null) { setUnavailable(true); setScore(0); }
    else { setUnavailable(false); setScore(result); }
  };
  const clear = () => { setStrokes([]); setScore(null); setUnavailable(false); };
  const next = () => { clear(); setIndex(index + 1); };

  const tier = score === null ? null
    : score >= 75 ? { c: colors.success, t: "Great match!" }
    : score >= 45 ? { c: colors.goldDark, t: "Decent attempt, try tracing more closely." }
    : { c: colors.error, t: "Not quite. Trace directly over the faint guide." };

  return (
    <Screen hasHeader scroll={false}>
      <Text style={s.count}>Character {(index % CALLIGRAPHY_CHARS.length) + 1} of {CALLIGRAPHY_CHARS.length}</Text>
      <View style={s.ref}>
        <Text style={s.rom}>{ch.romanization}</Text>
        <Text style={s.hint}>Trace the faint character</Text>
      </View>

      <DrawingCanvas
        glyph={ch.glyph} font={font} strokes={strokes} strokeWidth={strokeWidth} size={size}
        onStrokesChange={(st) => { setStrokes(st); if (score !== null) { setScore(null); setUnavailable(false); } }}
        onSize={(w, h) => setSize((p) => (p.w === w && p.h === h ? p : { w, h }))} />

      {score !== null && tier ? (
        <View style={[s.result, { backgroundColor: (unavailable ? colors.textSecondary : tier.c) + "1F" }]}>
          <Ionicons name="checkmark-circle" size={22} color={unavailable ? colors.textSecondary : tier.c} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            {unavailable ? (
              <Text style={{ color: colors.textSecondary }}>
                Scoring isn't available on this device, but nice practice! Tap Next Character.
              </Text>
            ) : (
              <>
                <Text style={[s.sc, { color: tier.c }]}>{score}% match</Text>
                <Text style={{ color: tier.c }}>{tier.t}</Text>
              </>
            )}
          </View>
        </View>
      ) : null}

      <View style={s.btns}>
        <AppButton title="Clear" variant="ghost" onPress={clear} style={{ flex: 1 }} />
        {score === null
          ? <AppButton title="Check" onPress={check} disabled={strokes.length === 0 || !font} style={{ flex: 1 }} />
          : <AppButton title="Next Character" onPress={next} style={{ flex: 1 }} />}
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  count: { color: colors.textSecondary, textAlign: "center", marginBottom: 8 },
  ref: { alignItems: "center", marginBottom: 12 },
  rom: { fontSize: 22, fontWeight: "800", color: colors.goldDark },
  hint: { color: colors.textSecondary, fontSize: 12 },
  result: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 14, marginTop: 12 },
  sc: { fontWeight: "800", fontSize: 15 },
  btns: { flexDirection: "row", gap: 10, marginTop: 12 },
});