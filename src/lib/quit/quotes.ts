export const URGE_LINES = [
  "This wave is weather. It passes.",
  "You already waited out worse than this minute.",
  "Breathe first. Decide after.",
  "Nothing has to be solved in the next four counts.",
  "The craving is loud. It is also brief.",
  "You are not starting over. You are still in it.",
  "Keep your hands busy. Keep the air clean.",
  "One urge does not rewrite the days behind you.",
];

export const HOME_LINES = [
  "The count is the work. Nothing else to prove today.",
  "Another clean interval. Keep it ordinary.",
  "The body is already using the time you gave it.",
];

export function urgeLineFor(now = Date.now()): string {
  const i = Math.floor(now / 60000) % URGE_LINES.length;
  return URGE_LINES[i] ?? URGE_LINES[0]!;
}

export function homeLineFor(now = Date.now()): string {
  const day = Math.floor(now / 86400000);
  return HOME_LINES[day % HOME_LINES.length] ?? HOME_LINES[0]!;
}
