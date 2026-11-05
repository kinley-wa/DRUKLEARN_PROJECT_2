import { colors } from "@/constants/theme";
import { glyphOrigin } from "@/utils/scoring";
import { Canvas, Path, Skia, Text as SkiaText } from "@shopify/react-native-skia";
import { useMemo, useRef } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

export default function DrawingCanvas({
  glyph,
  font,
  strokes,
  strokeWidth,
  onStrokesChange,
  onSize,
  size,
}) {
  const local = useRef(strokes);
  local.current = strokes;

  const notify = useRef(onStrokesChange);
  notify.current = onStrokesChange;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,

        onPanResponderGrant: (e) => {
          const point = {
            x: e.nativeEvent.locationX,
            y: e.nativeEvent.locationY,
          };
          local.current = [...local.current, [point]];
          notify.current(local.current);
        },

        onPanResponderMove: (e) => {
          const point = {
            x: e.nativeEvent.locationX,
            y: e.nativeEvent.locationY,
          };
          const current = local.current;
          if (!current.length) return;
          const last = current[current.length - 1];
          local.current = [...current.slice(0, -1), [...last, point]];
          notify.current(local.current);
        },
      }),
    []
  );

  // Convert strokes into Skia paths (single taps become a dot).
  const paths = useMemo(() => {
    return strokes.flatMap((stroke) => {
      if (!Array.isArray(stroke)) return [];

      const points = stroke.filter(
        (p) => Number.isFinite(p?.x) && Number.isFinite(p?.y)
      );
      if (points.length === 0) return [];

      const pts =
        points.length === 1
          ? [points[0], { x: points[0].x + 0.1, y: points[0].y }]
          : points;

      const svgPath = pts
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");

      const path = Skia.Path.MakeFromSVGString(svgPath);
      return path ? [path] : [];
    });
  }, [strokes]);

  const origin =
    font && size.w > 0 ? glyphOrigin(font, glyph, size.w, size.h) : null;

  return (
    // The border lives on this outer frame, so the touched view and the
    // canvas share exactly the same origin (no 2px shift).
    <View style={s.frame}>
      <View
        style={s.box}
        onLayout={(e) =>
          onSize(e.nativeEvent.layout.width, e.nativeEvent.layout.height)
        }
        {...pan.panHandlers}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {font && origin ? (
              <SkiaText
                x={origin.x}
                y={origin.y}
                text={glyph}
                font={font}
                color="rgba(122,127,140,0.22)"
              />
            ) : null}

            {paths.map((path, index) => (
              <Path
                key={index}
                path={path}
                style="stroke"
                strokeWidth={strokeWidth}
                color={colors.navy}
                strokeCap="round"
                strokeJoin="round"
              />
            ))}
          </Canvas>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  frame: {
    flex: 1,
    minHeight: 280,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: "#FDF8F0",
    overflow: "hidden",
  },
  box: {
    flex: 1,
  },
});