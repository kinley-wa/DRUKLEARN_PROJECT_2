const unlocked = new Set();
export const isUnlocked = (key) => unlocked.has(key);
export const markUnlocked = (key) => { unlocked.add(key); };