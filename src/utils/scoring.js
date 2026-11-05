import { AlphaType, ColorType, PaintStyle, Skia, StrokeCap, StrokeJoin } from "@shopify/react-native-skia";

// Where the guide glyph is drawn so its ink is centred. Used by BOTH the display and the scoring,
// so the student traces exactly what is scored.
export function glyphOrigin(font, glyph, w, h) {
  const b = font.measureText(glyph);
  return { x: w / 2 - (b.x + b.width / 2), y: h / 2 - (b.y + b.height / 2) };
}

function alphaMask(draw, w, h) {
  const surface = Skia.Surface.MakeOffscreen(w, h);
  if (!surface) return null;
  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color("transparent"));
  draw(canvas);
  surface.flush();
  const img = surface.makeImageSnapshot();
  const px = img.readPixels(0, 0, { width: w, height: h, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Unpremul });
  if (!px) return null;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4 + 3] > 40 ? 1 : 0;
  return mask;
}

// 0-100 shape-and-position match, or null if this device can't read pixels.
export function scoreTracing({ glyph, font, strokes, width, height, strokeWidth }) {
  const w = Math.round(width), h = Math.round(height);
  if (w < 10 || h < 10) return null;
  try {
    const origin = glyphOrigin(font, glyph, w, h);
    const ref = alphaMask((canvas) => {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("white"));
      paint.setAntiAlias(true);
      canvas.drawText(glyph, origin.x, origin.y, paint, font);
    }, w, h);

    const drawn = alphaMask((canvas) => {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("white"));
      paint.setAntiAlias(true);
      paint.setStyle(PaintStyle.Stroke);
      paint.setStrokeWidth(strokeWidth);
      paint.setStrokeCap(StrokeCap.Round);
      paint.setStrokeJoin(StrokeJoin.Round);
      for (const s of strokes) {
        if (s.length < 2) continue;
        const path = Skia.Path.Make();
        path.moveTo(s[0].x, s[0].y);
        for (let i = 1; i < s.length; i++) path.lineTo(s[i].x, s[i].y);
        canvas.drawPath(path, paint);
      }
    }, w, h);

    if (!ref || !drawn) return null;
    let inter = 0, union = 0;
    for (let i = 0; i < ref.length; i++) {
      if (ref[i] || drawn[i]) union++;
      if (ref[i] && drawn[i]) inter++;
    }
    if (union === 0) return 0;
    // Same calibration as Project I: a marker stroke is thicker than a font stroke, so raw IoU is harsh.
    return Math.min(100, Math.round((inter / union) * 220));
  } catch (e) {
    return null;
  }
}