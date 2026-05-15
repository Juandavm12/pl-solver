import {
  intersect,
  isActive,
  isFeasible,
  samePoint,
  sortAngular,
} from "./geometry";
import {
  Constraint,
  EPSILON,
  Objective,
  Problem,
  Solution,
  Vertex,
} from "./types";

/**
 * Implicit non-negativity constraints x₁ ≥ 0, x₂ ≥ 0.
 * Always appended to the user-supplied constraints.
 */
const NON_NEGATIVITY: Constraint[] = [
  { a1: 1, a2: 0, op: ">=", b: 0, label: "x₁ ≥ 0" },
  { a1: 0, a2: 1, op: ">=", b: 0, label: "x₂ ≥ 0" },
];

function evaluate(objective: Objective, point: { x1: number; x2: number }): number {
  return objective.c1 * point.x1 + objective.c2 * point.x2;
}

/**
 * Detect whether the feasible region is unbounded *in the objective's improvement direction*.
 *
 * Method: at every vertex, walk along the boundary of each active constraint in both
 * directions. If a direction (a) keeps every other constraint satisfied indefinitely
 * (no constraint blocks the move) and (b) improves the objective, the problem is unbounded.
 */
function isUnboundedTowardObjective(
  vertices: Vertex[],
  constraints: Constraint[],
  objective: Objective,
): boolean {
  for (const v of vertices) {
    for (const idx of v.activeConstraints) {
      const c = constraints[idx];
      // Direction vectors along the line a1·x1 + a2·x2 = b.
      const dirs = [
        { x1: -c.a2, x2: c.a1 },
        { x1: c.a2, x2: -c.a1 },
      ];

      for (const d of dirs) {
        const cdotd = evaluate(objective, d);
        const improves =
          objective.type === "max"
            ? cdotd > EPSILON
            : cdotd < -EPSILON;
        if (!improves) continue;

        let blocked = false;
        for (let k = 0; k < constraints.length; k++) {
          if (k === idx) continue;
          const ck = constraints[k];
          const rate = ck.a1 * d.x1 + ck.a2 * d.x2;
          if (ck.op === "<=" && rate > EPSILON) { blocked = true; break; }
          if (ck.op === ">=" && rate < -EPSILON) { blocked = true; break; }
          if (ck.op === "=" && Math.abs(rate) > EPSILON) { blocked = true; break; }
        }

        if (!blocked) return true;
      }
    }
  }
  return false;
}

/**
 * Solve a 2-variable linear program via the graphical / vertex-enumeration method.
 *
 * Pipeline:
 *   1. Append x₁≥0, x₂≥0 to the user constraints.
 *   2. Generate every pairwise line intersection.
 *   3. Keep only points that satisfy every constraint (= feasible vertices).
 *   4. Deduplicate (merging active-constraint indices).
 *   5. If no vertices → infeasible.
 *   6. If region extends in an improving direction → unbounded.
 *   7. Otherwise pick the max/min Z and detect alternate optima (multiple-optimal).
 */
export function solve(problem: Problem): Solution {
  const allConstraints = [...problem.constraints, ...NON_NEGATIVITY];
  const candidates: Array<{ point: { x1: number; x2: number }; pair: [number, number] }> = [];

  for (let i = 0; i < allConstraints.length; i++) {
    for (let j = i + 1; j < allConstraints.length; j++) {
      const p = intersect(allConstraints[i], allConstraints[j]);
      if (p) candidates.push({ point: p, pair: [i, j] });
    }
  }

  const vertices: Vertex[] = [];
  for (const { point, pair } of candidates) {
    if (!isFeasible(point, allConstraints)) continue;

    const existing = vertices.find((v) => samePoint(v, point));
    if (existing) {
      for (const k of pair) {
        if (!existing.activeConstraints.includes(k)) existing.activeConstraints.push(k);
      }
      continue;
    }

    // Build the full active-constraint set: any constraint that holds with equality here.
    const active: number[] = [];
    for (let k = 0; k < allConstraints.length; k++) {
      if (isActive(point, allConstraints[k])) active.push(k);
    }

    vertices.push({
      x1: point.x1,
      x2: point.x2,
      z: evaluate(problem.objective, point),
      activeConstraints: active,
    });
  }

  if (vertices.length === 0) {
    return {
      status: "infeasible",
      vertices: [],
      message:
        "La región factible es vacía — no existe ningún (x₁, x₂) que cumpla todas las restricciones simultáneamente.",
    };
  }

  if (isUnboundedTowardObjective(vertices, allConstraints, problem.objective)) {
    return {
      status: "unbounded",
      vertices: sortAngular(vertices),
      message:
        problem.objective.type === "max"
          ? "La región factible se extiende indefinidamente en la dirección de mejora del objetivo: el problema no tiene óptimo finito (Z → +∞)."
          : "La región factible se extiende indefinidamente en la dirección de mejora del objetivo: el problema no tiene óptimo finito (Z → −∞).",
    };
  }

  const sorted = sortAngular(vertices);
  const compare =
    problem.objective.type === "max"
      ? (a: Vertex, b: Vertex) => b.z - a.z
      : (a: Vertex, b: Vertex) => a.z - b.z;
  const ranked = [...sorted].sort(compare);
  const best = ranked[0];
  const alternate = ranked.find(
    (v, i) => i > 0 && Math.abs(v.z - best.z) < EPSILON,
  );

  return {
    status: alternate ? "multiple-optimal" : "optimal",
    vertices: sorted,
    optimal: best,
    alternateOptimal: alternate,
    optimalValue: best.z,
    message: alternate
      ? `Existen infinitas soluciones óptimas a lo largo del segmento que une (${best.x1.toFixed(4)}, ${best.x2.toFixed(4)}) y (${alternate.x1.toFixed(4)}, ${alternate.x2.toFixed(4)}). La función objetivo es paralela a una restricción activa. Z* = ${best.z.toFixed(4)}.`
      : `Solución óptima única en (x₁, x₂) = (${best.x1.toFixed(4)}, ${best.x2.toFixed(4)}) con Z* = ${best.z.toFixed(4)}.`,
  };
}
