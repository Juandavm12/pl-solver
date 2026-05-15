import { Constraint, Problem, Solution } from "@/lib/solver";

export interface ViewBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const EPS = 1e-9;

/**
 * Compute a viewport that comfortably contains every feasible vertex AND every
 * axis-intercept of every constraint, padded by ~25% and snapped to a "nice"
 * integer upper bound.
 */
export function computeViewBox(problem: Problem, solution: Solution): ViewBox {
  let maxX = 6;
  let maxY = 6;

  for (const v of solution.vertices) {
    if (Number.isFinite(v.x1)) maxX = Math.max(maxX, v.x1);
    if (Number.isFinite(v.x2)) maxY = Math.max(maxY, v.x2);
  }

  for (const c of problem.constraints) {
    if (Math.abs(c.a1) > EPS) maxX = Math.max(maxX, Math.abs(c.b / c.a1));
    if (Math.abs(c.a2) > EPS) maxY = Math.max(maxY, Math.abs(c.b / c.a2));
  }

  maxX = niceCeil(maxX * 1.25);
  maxY = niceCeil(maxY * 1.25);

  return { minX: 0, maxX, minY: 0, maxY };
}

/**
 * Round n up to a "nice" number that aligns well with generated ticks,
 * regardless of magnitude. Examples:
 *   7   → 8       (step 2)
 *   12  → 15      (step 5)
 *   375 → 400     (step 100)
 *   800 → 800     (already a multiple of 200)
 *   1234 → 1500   (step 500)
 *   8500 → 10000  (step 2000)
 */
function niceCeil(n: number): number {
  if (n <= 5) return 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
  const normalized = n / magnitude;
  let step: number;
  if (normalized <= 1) step = 0.2 * magnitude;
  else if (normalized <= 2) step = 0.5 * magnitude;
  else if (normalized <= 5) step = 1 * magnitude;
  else step = 2 * magnitude;
  return Math.ceil(n / step) * step;
}

/**
 * Clip the line `a1·x + a2·y = b` to a rectangular viewport. Returns the two
 * endpoints where the line enters/exits the box, or null if the line misses it.
 *
 * Strategy: intersect the line with each of the 4 box edges, keep intersections
 * that lie ON the edge, deduplicate corners.
 */
export function clipLineToBox(
  c: Constraint,
  box: ViewBox,
): [{ x: number; y: number }, { x: number; y: number }] | null {
  const candidates: Array<{ x: number; y: number }> = [];

  // Vertical edges (left and right): solve for y at x = const
  if (Math.abs(c.a2) > EPS) {
    for (const x of [box.minX, box.maxX]) {
      const y = (c.b - c.a1 * x) / c.a2;
      if (y >= box.minY - EPS && y <= box.maxY + EPS) candidates.push({ x, y });
    }
  }

  // Horizontal edges (bottom and top): solve for x at y = const
  if (Math.abs(c.a1) > EPS) {
    for (const y of [box.minY, box.maxY]) {
      const x = (c.b - c.a2 * y) / c.a1;
      if (x >= box.minX - EPS && x <= box.maxX + EPS) candidates.push({ x, y });
    }
  }

  const unique = candidates.filter(
    (p, i) =>
      candidates.findIndex(
        (q) => Math.abs(p.x - q.x) < 1e-6 && Math.abs(p.y - q.y) < 1e-6,
      ) === i,
  );

  if (unique.length < 2) return null;
  return [unique[0], unique[1]];
}

/**
 * Generate "nice" tick positions on [0, max].
 * Aims for ~8-10 ticks; falls back to integer steps.
 */
export function generateTicks(max: number, target = 10): number[] {
  const raw = max / target;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / magnitude;
  let step: number;
  if (normalized < 1.5) step = 1 * magnitude;
  else if (normalized < 3) step = 2 * magnitude;
  else if (normalized < 7) step = 5 * magnitude;
  else step = 10 * magnitude;

  const ticks: number[] = [];
  for (let v = 0; v <= max + EPS; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

/**
 * Vertex label by index — A, B, C… AA, AB, …
 */
export function vertexLetter(i: number): string {
  let s = "";
  let n = i;
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}
