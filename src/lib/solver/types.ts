export type Inequality = "<=" | ">=" | "=";
export type ObjectiveType = "max" | "min";

export interface Constraint {
  a1: number;
  a2: number;
  op: Inequality;
  b: number;
  label?: string;
}

export interface Objective {
  type: ObjectiveType;
  c1: number;
  c2: number;
}

export interface Problem {
  objective: Objective;
  constraints: Constraint[];
}

export interface Point {
  x1: number;
  x2: number;
}

export interface Vertex extends Point {
  z: number;
  activeConstraints: number[];
}

export type SolutionStatus =
  | "optimal"
  | "infeasible"
  | "unbounded"
  | "multiple-optimal";

export interface Solution {
  status: SolutionStatus;
  vertices: Vertex[];
  optimal?: Vertex;
  alternateOptimal?: Vertex;
  optimalValue?: number;
  message: string;
}

export const EPSILON = 1e-9;
