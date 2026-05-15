export const CONSTRAINT_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#10b981", // emerald
  "#f59e0b", // amber
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#ef4444", // red
  "#84cc16", // lime
] as const;

export function constraintColor(i: number): string {
  return CONSTRAINT_COLORS[i % CONSTRAINT_COLORS.length];
}
