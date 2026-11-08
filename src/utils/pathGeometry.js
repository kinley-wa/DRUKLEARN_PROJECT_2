// Layout constants. Tweak these to change the spacing of the road.
export const SEG = 170;         // vertical distance between two topics
export const HZ = 210;          // y of the horizon (where the road meets the dzong)
export const TOP_GAP = 170;     // space between the horizon and the last topic
export const BOTTOM_GAP = 210;  // space below the first topic (START sign)

// Topic i = 0 is at the BOTTOM of the screen; the last topic is nearest the horizon.
export function computeLayout(width, n) {
  const height = HZ + TOP_GAP + Math.max(0, n - 1) * SEG + BOTTOM_GAP;
  const nodes = [];
  for (let i = 0; i < n; i++) {
    nodes.push({ x: i % 2 === 0 ? width * 0.32 : width * 0.68, y: height - BOTTOM_GAP - i * SEG });
  }
  const start = { x: width * 0.5, y: height + 20 };
  const end = { x: width * 0.5, y: HZ + 8 };
  return { height, nodes, points: [start, ...nodes, end] };
}

// One smooth S-shaped road piece between two points.
export function segmentPath(a, b) {
  const my = (a.y + b.y) / 2;
  return `M${a.x} ${a.y} C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
}

// The whole road as a single path (used for the dashed centre line).
export function fullPath(points) {
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const my = (a.y + b.y) / 2;
    d += ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
  }
  return d;
}