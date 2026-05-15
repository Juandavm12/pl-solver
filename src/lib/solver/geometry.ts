import { Constraint, EPSILON, Point } from "./types";

/**
 * Intersect two lines defined by constraints (treated as equalities).
 * Returns null if the lines are parallel (no unique intersection).
 *
 * Constraint i:  a1·x1 + a2·x2 = b
 *
 * Solving the 2×2 system via Cramer's rule:
 *   det = a1_i · a2_j − a2_i · a1_j
 *   if det ≈ 0 → parallel lines
 */
export function intersect(c1: Constraint, c2: Constraint): Point | null {
  const det = c1.a1 * c2.a2 - c1.a2 * c2.a1;
  if (Math.abs(det) < EPSILON) return null;

  const x1 = (c1.b * c2.a2 - c1.a2 * c2.b) / det;
  const x2 = (c1.a1 * c2.b - c1.b * c2.a1) / det;
  return { x1, x2 };
}

/**
 * Test whether a single constraint is satisfied at the given point (within tolerance).
 */
export function satisfies(point: Point, c: Constraint, tol = EPSILON): boolean {
  const lhs = c.a1 * point.x1 + c.a2 * point.x2;
  switch (c.op) {
    case "<=":
      return lhs <= c.b + tol;
    case ">=":
      return lhs >= c.b - tol;
    case "=":
      return Math.abs(lhs - c.b) <= tol;
  }
}

/**
 * Test whether a point satisfies every constraint in the list.
 */
export function isFeasible(
  point: Point,
  constraints: Constraint[],
  tol = EPSILON,
): boolean {
  return constraints.every((c) => satisfies(point, c, tol));
}

/**
 * Test whether a constraint is active at the point (lhs ≈ b).
 */
export function isActive(point: Point, c: Constraint, tol = EPSILON): boolean {
  const lhs = c.a1 * point.x1 + c.a2 * point.x2;
  return Math.abs(lhs - c.b) <= tol;
}

/**
 * Two points are considered the same vertex if their coordinates agree within tolerance.
 */
export function samePoint(a: Point, b: Point, tol = EPSILON): boolean {
  return Math.abs(a.x1 - b.x1) <= tol && Math.abs(a.x2 - b.x2) <= tol;
}

/**
 * Sort points counter-clockwise around their centroid. This produces the polygon
 * traversal order used for drawing the feasible region as a closed shape.
 */
export function sortAngular<T extends Point>(points: T[]): T[] {
  if (points.length <= 2) return [...points];
  const cx = points.reduce((s, p) => s + p.x1, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.x2, 0) / points.length;
  return [...points].sort(
    (a, b) =>
      Math.atan2(a.x2 - cy, a.x1 - cx) - Math.atan2(b.x2 - cy, b.x1 - cx),
  );
}
