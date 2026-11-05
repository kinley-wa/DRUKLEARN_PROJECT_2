import { colors } from "@/constants/theme";
import { glyphOrigin } from "@/utils/scoring";
import { Canvas, Path, Skia, Text as SkiaText } from "@shopify/react-native-skia";
import { useMemo, useRef } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

export default function DrawingCanvas({ glyph, font, strokes, strokeWidth, onStrokesChange, onSize, size }) {
  const local = useRef(strokes);
  local.current = strokes;                  // parent clearing the strokes resets ours
  const notify = useRef(onStrokesChange);
  notify.current = onStrokesChange;         // always call the latest handler

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => {
      local.current = [...local.current, [{ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY }]];
      notify.current(local.current);
    },
    onPanResponderMove: (e) => {
      const cur = local.current;
      if (!cur.length) return;
      const last = cur[cur.length - 1];
      local.current = [...cur.slice(0, -1), [...last, { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY }]];
      notify.current(local.current);
    },
  }), []);

  const paths = strokes.filter((s) => s.length > 1).map((s) => {
    const p = Skia.Path.Make();
    p.moveTo(s[0].x, s[0].y);
    s.slice(1).forEach((pt) => p.lineTo(pt.x, pt.y));
    return p;
  });
  const origin = font && size.w > 0 ? glyphOrigin(font, glyph, size.w, size.h) : null;

  return (
    <View
      style={s.box}
      onLayout={(e) => onSize(e.nativeEvent.layout.width, e.nativeEvent.layout.height)}
      {...pan.panHandlers}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Canvas style={StyleSheet.absoluteFill}>
          {font && origin ? (
            <SkiaText x={origin.x} y={origin.y} text={glyph} font={font} color="rgba(122,127,140,0.22)" />
          ) : null}
          {paths.map((p, i) => (
            <Path key={i} path={p} style="stroke" strokeWidth={strokeWidth} color={colors.navy} strokeCap="round" strokeJoin="round" />
          ))}
        </Canvas>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  box: { flex: 1, minHeight: 280, borderRadius: 20, borderWidth: 2, borderColor: colors.gold, backgroundColor: "#FDF8F0", overflow: "hidden" },
});