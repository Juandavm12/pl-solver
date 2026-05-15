import { Problem } from "./types";

export interface ExampleProblem {
  id: string;
  title: string;
  description: string;
  expected: string;
  problem: Problem;
}

/**
 * Problemas clásicos de PL usados para validar el motor de cálculo.
 * Cada uno trae el resultado esperado (resuelto a mano) en `expected`.
 */
export const EXAMPLES: ExampleProblem[] = [
  {
    id: "production",
    title: "Producción de muebles",
    description:
      "Una mueblería fabrica mesas (x₁) y sillas (x₂). Cada mesa requiere 2h de carpintería y 1h de pintura. Cada silla requiere 1h de carpintería y 3h de pintura. Se dispone de 8h de carpintería y 9h de pintura. La mesa deja $3 y la silla $2. Maximizar utilidad.",
    expected: "Óptimo en (3, 2) con Z = 13.",
    problem: {
      objective: { type: "max", c1: 3, c2: 2 },
      constraints: [
        { a1: 2, a2: 1, op: "<=", b: 8, label: "Carpintería" },
        { a1: 1, a2: 3, op: "<=", b: 9, label: "Pintura" },
      ],
    },
  },
  {
    id: "diet",
    title: "Problema de la dieta",
    description:
      "Una dieta combina dos alimentos (x₁, x₂). Cada unidad de x₁ aporta 2 g de proteína y 1 g de grasa; cada unidad de x₂ aporta 1 g de proteína y 2 g de grasa. La dieta requiere al menos 6 g de proteína y al menos 6 g de grasa. El alimento x₁ cuesta $4/unidad y x₂ cuesta $3/unidad. Minimizar costo.",
    expected: "Óptimo en (2, 2) con Z = 14.",
    problem: {
      objective: { type: "min", c1: 4, c2: 3 },
      constraints: [
        { a1: 2, a2: 1, op: ">=", b: 6, label: "Proteína" },
        { a1: 1, a2: 2, op: ">=", b: 6, label: "Grasa" },
      ],
    },
  },
  {
    id: "multiple",
    title: "Múltiples óptimos",
    description:
      "Maximizar Z = 2x₁ + 4x₂ con x₁ + 2x₂ ≤ 8 y x₁ ≤ 4. La función objetivo es paralela a la primera restricción → toda la arista óptima es solución.",
    expected: "Z* = 16. Soluciones a lo largo del segmento de (0, 4) a (4, 2).",
    problem: {
      objective: { type: "max", c1: 2, c2: 4 },
      constraints: [
        { a1: 1, a2: 2, op: "<=", b: 8 },
        { a1: 1, a2: 0, op: "<=", b: 4 },
      ],
    },
  },
  {
    id: "infeasible",
    title: "Infactible",
    description: "x₁ + x₂ ≤ 2 y x₁ + x₂ ≥ 5 son incompatibles.",
    expected: "Status: infeasible.",
    problem: {
      objective: { type: "max", c1: 1, c2: 1 },
      constraints: [
        { a1: 1, a2: 1, op: "<=", b: 2 },
        { a1: 1, a2: 1, op: ">=", b: 5 },
      ],
    },
  },
  {
    id: "industrial",
    title: "Producción industrial",
    description:
      "Una planta fabrica dos productos. Cada unidad de x₁ requiere 4h de máquina y 2h de mano de obra; x₂ requiere 2h de máquina y 3h de mano de obra. Se disponen de 800h de máquina y 600h de mano de obra por mes. La utilidad es $50/unidad de x₁ y $30/unidad de x₂. Maximizar utilidad mensual.",
    expected: "Óptimo en (150, 100) con Z = 10.500.",
    problem: {
      objective: { type: "max", c1: 50, c2: 30 },
      constraints: [
        { a1: 4, a2: 2, op: "<=", b: 800, label: "Máquina (h)" },
        { a1: 2, a2: 3, op: "<=", b: 600, label: "Mano de obra (h)" },
      ],
    },
  },
  {
    id: "unbounded",
    title: "No acotado",
    description:
      "Maximizar Z = x₁ + x₂ con sólo x₁ ≥ 1, x₂ ≥ 1. Nada acota por arriba a x₁ o x₂.",
    expected: "Status: unbounded (Z → +∞).",
    problem: {
      objective: { type: "max", c1: 1, c2: 1 },
      constraints: [
        { a1: 1, a2: 0, op: ">=", b: 1 },
        { a1: 0, a2: 1, op: ">=", b: 1 },
      ],
    },
  },
];
