import {
    AlphaType,
    ColorType,
    PaintStyle,
    Skia,
    StrokeCap,
    StrokeJoin,
} from "@shopify/react-native-skia";

// Centre the Tibetan character in the drawing area.
export function glyphOrigin(font, glyph, w, h) {
  const b = font.measureText(glyph);
  return {
    x: w / 2 - (b.x + b.width / 2),
    y: h / 2 - (b.y + b.height / 2),
  };
}

// Render content offscreen and convert it into a 0/1 pixel mask.
function alphaMask(draw, w, h) {
  const surface = Skia.Surface.MakeOffscreen(w, h);
  if (!surface) {
    console.warn("Could not create Skia offscreen surface.");
    return null;
  }

  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color("transparent"));
  draw(canvas);
  surface.flush();

  const image = surface.makeImageSnapshot();
  const pixels = image.readPixels(0, 0, {
    width: w,
    height: h,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });

  if (!pixels) {
    console.warn("Could not read Skia pixels.");
    return null;
  }

  const mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++) {
    mask[i] = pixels[i * 4 + 3] > 40 ? 1 : 0;
  }
  return mask;
}

// Square dilation using prefix sums, O(w*h) regardless of radius.
function dilate(mask, w, h, r) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  const pre = new Int32Array(Math.max(w, h) + 1);

  // horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) pre[x + 1] = pre[x] + mask[y * w + x];
    for (let x = 0; x < w; x++) {
      const lo = Math.max(0, x - r);
      const hi = Math.min(w - 1, x + r);
      tmp[y * w + x] = pre[hi + 1] - pre[lo] > 0 ? 1 : 0;
    }
  }

  // vertical pass
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) pre[y + 1] = pre[y] + tmp[y * w + x];
    for (let y = 0; y < h; y++) {
      const lo = Math.max(0, y - r);
      const hi = Math.min(h - 1, y + r);
      out[y * w + x] = pre[hi + 1] - pre[lo] > 0 ? 1 : 0;
    }
  }
  return out;
}

const THIN = 3; // centreline width used for scoring only

// Calculate tracing accuracy (0-100).
export function scoreTracing({
  glyph,
  font,
  strokes,
  width,
  height,
  strokeWidth,
}) {
  const w = Math.round(width);
  const h = Math.round(height);

  if (w < 10 || h < 10 || !font || !strokes?.length) return null;

  try {
    const origin = glyphOrigin(font, glyph, w, h);

    // Tolerance: lower multiplier = stricter scoring.
    const tol = Math.max(3, Math.round(strokeWidth * 0.5));

    // Reference glyph mask.
    const reference = alphaMask((canvas) => {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("white"));
      paint.setAntiAlias(true);
      canvas.drawText(glyph, origin.x, origin.y, paint, font);
    }, w, h);

    // Student's drawing mask (thin centreline).
    const drawing = alphaMask((canvas) => {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("white"));
      paint.setAntiAlias(true);
      paint.setStyle(PaintStyle.Stroke);
      paint.setStrokeWidth(THIN);
      paint.setStrokeCap(StrokeCap.Round);
      paint.setStrokeJoin(StrokeJoin.Round);

      for (const stroke of strokes) {
        if (!Array.isArray(stroke)) continue;

        const points = stroke.filter(
          (p) => Number.isFinite(p?.x) && Number.isFinite(p?.y)
        );
        if (points.length === 0) continue;

        const pts =
          points.length === 1
            ? [points[0], { x: points[0].x + 0.1, y: points[0].y }]
            : points;

        const svgPath = pts
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ");

        const path = Skia.Path.MakeFromSVGString(svgPath);
        if (path) canvas.drawPath(path, paint);
      }
    }, w, h);

    if (!reference || !drawing) return null;

    const nearDrawing = dilate(drawing, w, h, tol);
    const nearRef = dilate(reference, w, h, tol);

    let refTotal = 0;
    let refHit = 0;
    let drawTotal = 0;
    let drawHit = 0;

    for (let i = 0; i < reference.length; i++) {
      if (reference[i]) {
        refTotal++;
        if (nearDrawing[i]) refHit++;
      }
      if (drawing[i]) {
        drawTotal++;
        if (nearRef[i]) drawHit++;
      }
    }

    if (refTotal === 0 || drawTotal === 0) return 0;

    const coverage = refHit / refTotal;   // how much of the glyph was traced
    const precision = drawHit / drawTotal; // how much of the drawing is on the glyph
    if (coverage + precision === 0) return 0;

    const f1 = (2 * coverage * precision) / (coverage + precision);
    return Math.round(f1 * 100);
  } catch (error) {
    console.warn("Calligraphy scoring error:", error);
    return null;
  }
}