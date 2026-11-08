import { HZ, fullPath, segmentPath } from "@/utils/pathGeometry";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from "react-native-svg";

function Mountain({ px, bw, mh, color }) {
  const capW = bw * 0.3;
  const capH = mh * 0.3;
  return (
    <G>
      <Polygon points={`${px - bw},${HZ} ${px},${HZ - mh} ${px + bw},${HZ}`} fill={color} />
      <Polygon points={`${px - capW},${HZ - mh + capH} ${px},${HZ - mh} ${px + capW},${HZ - mh + capH}`} fill="#fff" opacity={0.9} />
    </G>
  );
}

function Cloud({ x, y, s = 1 }) {
  return (
    <G opacity={0.95}>
      <Ellipse cx={x} cy={y} rx={34 * s} ry={14 * s} fill="#fff" />
      <Ellipse cx={x - 22 * s} cy={y + 4 * s} rx={22 * s} ry={11 * s} fill="#fff" />
      <Ellipse cx={x + 24 * s} cy={y + 5 * s} rx={24 * s} ry={11 * s} fill="#fff" />
    </G>
  );
}

function Tree({ x, y, s }) {
  return (
    <G x={x} y={y}>
      <Ellipse cx={0} cy={14 * s} rx={15 * s} ry={4 * s} fill="rgba(0,0,0,0.13)" />
      <Rect x={-3 * s} y={0} width={6 * s} height={14 * s} fill="#7A5230" />
      <Circle cx={0} cy={-8 * s} r={16 * s} fill="#2F8F4E" />
      <Circle cx={-9 * s} cy={-2 * s} r={11 * s} fill="#3FA860" />
      <Circle cx={9 * s} cy={-3 * s} r={11 * s} fill="#46B56A" />
    </G>
  );
}

function Dzong({ cx }) {
  return (
    <G>
      <Ellipse cx={cx} cy={HZ + 8} rx={115} ry={20} fill="#6DBA73" />
      <Polygon points={`${cx - 74},${HZ + 4} ${cx + 74},${HZ + 4} ${cx + 62},${HZ - 50} ${cx - 62},${HZ - 50}`} fill="#F7F1E3" />
      <Rect x={cx - 64} y={HZ - 52} width={128} height={11} fill="#8B2E2E" />
      <Rect x={cx - 22} y={HZ - 92} width={44} height={42} fill="#F7F1E3" />
      <Rect x={cx - 24} y={HZ - 94} width={48} height={9} fill="#8B2E2E" />
      <Polygon points={`${cx - 30},${HZ - 94} ${cx},${HZ - 122} ${cx + 30},${HZ - 94}`} fill="#E8A33D" />
      <Rect x={cx - 9} y={HZ - 20} width={18} height={24} rx={3} fill="#3B2A20" />
      {[-44, -30, 30, 44].map((dx) => (
        <Rect key={dx} x={cx + dx - 4} y={HZ - 36} width={8} height={11} rx={1.5} fill="#5B4636" />
      ))}
    </G>
  );
}

function PrayerFlags({ width }) {
  const y0 = HZ + 40;
  const x0 = width * 0.14;
  const x2 = width * 0.86;
  const cy = y0 + 34; // control point makes the string sag
  const flagColors = ["#3C7BD9", "#FFFFFF", "#E0483E", "#3FA860", "#F2C230"];
  const ts = [0.12, 0.31, 0.5, 0.69, 0.88];
  const point = (t) => ({
    x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x2) / 2) + t * t * x2,
    y: (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y0,
  });
  return (
    <G>
      <Rect x={x0 - 2} y={y0 - 6} width={4} height={46} fill="#6B4A2B" />
      <Rect x={x2 - 2} y={y0 - 6} width={4} height={46} fill="#6B4A2B" />
      <Path d={`M${x0} ${y0} Q${(x0 + x2) / 2} ${cy} ${x2} ${y0}`} stroke="#6B4A2B" strokeWidth={1.5} fill="none" />
      {ts.map((t, i) => {
        const p = point(t);
        return <Rect key={i} x={p.x - 7} y={p.y} width={14} height={17} fill={flagColors[i]} stroke="#cfd4dc" strokeWidth={0.5} />;
      })}
    </G>
  );
}

// doneUntil = index in `points` up to which the road has been travelled (0 = not started)
export default function RoadScene({ width, height, points, doneUntil }) {
  const count = points.length - 1;
  const segs = [];
  for (let i = 0; i < count; i++) {
    // the road gets narrower toward the horizon (perspective)
    segs.push({ d: segmentPath(points[i], points[i + 1]), w: 80 - 40 * (i / Math.max(1, count - 1)) });
  }

  const trees = [];
  const treeCount = Math.round(height / 90);
  for (let k = 0; k < treeCount; k++) {
    const y = HZ + 40 + k * 88 + (k % 3) * 14;
    if (y > height - 30) break;
    const jitter = (k * 37) % 5;
    const x = k % 2 === 0 ? width * (0.05 + 0.025 * jitter) : width * (0.95 - 0.025 * jitter);
    const s = 0.6 + 0.6 * ((y - HZ) / (height - HZ)); // bigger toward the bottom
    trees.push({ x, y, s, k });
  }

  return (
    <Svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7EC3F2" />
          <Stop offset="1" stopColor="#E2F3FF" />
        </LinearGradient>
        <LinearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9FD8A0" />
          <Stop offset="1" stopColor="#4BA262" />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={HZ} fill="url(#sky)" />
      <Circle cx={width * 0.84} cy={70} r={46} fill="#FFE9A8" opacity={0.45} />
      <Circle cx={width * 0.84} cy={70} r={28} fill="#FFD66B" />
      <Cloud x={width * 0.2} y={58} s={1} />
      <Cloud x={width * 0.58} y={104} s={0.8} />
      <Cloud x={width * 0.78} y={36} s={0.6} />

      <Mountain px={width * 0.5} bw={width * 0.22} mh={72} color="#BCCDE9" />
      <Mountain px={width * 0.14} bw={width * 0.26} mh={104} color="#A8BDE3" />
      <Mountain px={width * 0.82} bw={width * 0.3} mh={124} color="#98B0DB" />

      <Ellipse cx={width * 0.08} cy={HZ + 8} rx={width * 0.3} ry={30} fill="#7BC47F" />
      <Ellipse cx={width * 0.92} cy={HZ + 8} rx={width * 0.3} ry={30} fill="#6DBA73" />

      <Rect x={0} y={HZ} width={width} height={height - HZ} fill="url(#grass)" />
      <Dzong cx={width * 0.5} />
      <PrayerFlags width={width} />
      {trees.map((t) => <Tree key={t.k} x={t.x} y={t.y} s={t.s} />)}

      {/* road: shadow, kerb, white edge lines, asphalt */}
      <G y={5}>
        {segs.map((s, i) => (
          <Path key={`sh${i}`} d={s.d} stroke="rgba(0,0,0,0.18)" strokeWidth={s.w + 16} fill="none" strokeLinecap="round" />
        ))}
      </G>
      {segs.map((s, i) => (
        <Path key={`kb${i}`} d={s.d} stroke="#D9DCE1" strokeWidth={s.w + 14} fill="none" strokeLinecap="round" />
      ))}
      {segs.map((s, i) => (
        <Path key={`ed${i}`} d={s.d} stroke="#FFFFFF" strokeWidth={s.w} fill="none" strokeLinecap="round" />
      ))}
      {segs.map((s, i) => (
        <Path key={`as${i}`} d={s.d} stroke="#4F535C" strokeWidth={s.w - 7} fill="none" strokeLinecap="round" />
      ))}

      {/* centre line: white, and gold for the part you have travelled */}
      <Path d={fullPath(points)} stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={4} strokeDasharray="16 14" fill="none" />
      {doneUntil >= 1 ? (
        <Path d={fullPath(points.slice(0, doneUntil + 1))} stroke="#FFC83D" strokeWidth={5} strokeDasharray="16 14" fill="none" />
      ) : null}
    </Svg>
  );
}