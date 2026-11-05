const pad = (n) => String(n).padStart(2, "0");

// Local date as yyyy-MM-dd. Never use toISOString() for this: it is UTC and Bhutan is UTC+6.
export function toDateString(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parse(s) {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
export function daysBetween(from, to) {
  return Math.round((parse(to) - parse(from)) / 86400000);
}
// Monday of the current week as yyyy-MM-dd
export function weekStartString(d = new Date()) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return toDateString(copy);
}
export function daySeed(d = new Date()) {
  return Math.floor(parse(toDateString(d)) / 86400000);
}