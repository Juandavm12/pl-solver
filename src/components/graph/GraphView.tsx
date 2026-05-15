"use client";

import { scaleLinear } from "d3-scale";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { CONSTRAINT_COLORS } from "@/lib/colors";
import type { Problem, Solution, Vertex } from "@/lib/solver";

import {
  clipLineToBox,
  computeViewBox,
  generateTicks,
  vertexLetter,
} from "./viewport";

interface Props {
  problem: Problem;
  solution: Solution;
  width?: number;
  height?: number;
}

const PADDING = { top: 40, right: 160, bottom: 56, left: 64 };

export function GraphView({
  problem,
  solution,
  width = 780,
  height = 640,
}: Props) {
  const [hoveredVertex, setHoveredVertex] = useState<number | null>(null);
  const [hoveredConstraint, setHoveredConstraint] = useState<number | null>(null);

  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  const viewBox = useMemo(
    () => computeViewBox(problem, solution),
    [problem, solution],
  );

  const xScale = useMemo(
    () => scaleLinear().domain([viewBox.minX, viewBox.maxX]).range([0, innerW]),
    [viewBox.minX, viewBox.maxX, innerW],
  );
  const yScale = useMemo(
    () => scaleLinear().domain([viewBox.minY, viewBox.maxY]).range([innerH, 0]),
    [viewBox.minY, viewBox.maxY, innerH],
  );

  const xTicks = generateTicks(viewBox.maxX);
  const yTicks = generateTicks(viewBox.maxY);

  const sx = (v: number) => xScale(v) ?? 0;
  const sy = (v: number) => yScale(v) ?? 0;

  // Polygon path for the feasible region (vertices already sorted CCW by the solver).
  const regionPath = useMemo(() => {
    if (solution.vertices.length < 3) return null;
    return (
      solution.vertices
        .map(
          (v, i) =>
            `${i === 0 ? "M" : "L"} ${sx(v.x1).toFixed(2)} ${sy(v.x2).toFixed(2)}`,
        )
        .join(" ") + " Z"
    );
  }, [solution.vertices, sx, sy]);

  const isOptimal = (v: Vertex) =>
    solution.optimal &&
    Math.abs(v.x1 - solution.optimal.x1) < 1e-6 &&
    Math.abs(v.x2 - solution.optimal.x2) < 1e-6;

  const isAlternateOptimal = (v: Vertex) =>
    solution.alternateOptimal &&
    Math.abs(v.x1 - solution.alternateOptimal.x1) < 1e-6 &&
    Math.abs(v.x2 - solution.alternateOptimal.x2) < 1e-6;

  // Iso-Z slider — pedagogical level curve of the objective function.
  const showIsoZ =
    solution.status === "optimal" || solution.status === "multiple-optimal";

  const zRange = useMemo(() => {
    if (!showIsoZ || solution.vertices.length === 0) return null;
    const zs = solution.vertices.map((v) => v.z);
    let zMin = Math.min(...zs);
    let zMax = Math.max(...zs);
    if (zMin === zMax) {
      zMin -= 5;
      zMax += 5;
    } else {
      const span = zMax - zMin;
      zMin -= span * 0.2;
      zMax += span * 0.2;
    }
    return { zMin, zMax, optimal: solution.optimal?.z ?? (zMin + zMax) / 2 };
  }, [showIsoZ, solution.vertices, solution.optimal]);

  const [zLevel, setZLevel] = useState<number>(() => zRange?.optimal ?? 0);
  useEffect(() => {
    if (zRange) setZLevel(zRange.optimal);
  }, [zRange?.optimal]); // eslint-disable-line react-hooks/exhaustive-deps

  const isoSegment = useMemo(() => {
    if (!showIsoZ || !zRange) return null;
    return clipLineToBox(
      {
        a1: problem.objective.c1,
        a2: problem.objective.c2,
        op: "=",
        b: zLevel,
      },
      viewBox,
    );
  }, [showIsoZ, zRange, problem.objective, zLevel, viewBox]);

  // Constraints highlighted by hovered vertex (its "active" constraints)
  const hoveredActiveSet = useMemo(() => {
    if (hoveredVertex === null) return null;
    const v = solution.vertices[hoveredVertex];
    return v ? new Set(v.activeConstraints) : null;
  }, [hoveredVertex, solution.vertices]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
        role="img"
        aria-label="Gráfico del problema de programación lineal"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-500" />
          </marker>

          <linearGradient id="region-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.14" />
          </linearGradient>

          <filter id="optimal-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
          {/* Grid */}
          <g className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1}>
            {xTicks.map((t) => (
              <line key={`gx-${t}`} x1={sx(t)} x2={sx(t)} y1={0} y2={innerH} />
            ))}
            {yTicks.map((t) => (
              <line key={`gy-${t}`} x1={0} x2={innerW} y1={sy(t)} y2={sy(t)} />
            ))}
          </g>

          {/* Feasible region */}
          {regionPath && solution.status !== "infeasible" && (
            <motion.path
              d={regionPath}
              fill="url(#region-gradient)"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{ transformOrigin: "center" }}
            />
          )}

          {/* Constraint lines */}
          {problem.constraints.map((c, i) => {
            const seg = clipLineToBox(c, viewBox);
            if (!seg) return null;
            const color = CONSTRAINT_COLORS[i % CONSTRAINT_COLORS.length];
            const isHovered = hoveredConstraint === i;
            const isActive = hoveredActiveSet?.has(i) ?? false;
            const isDimmed =
              hoveredActiveSet !== null && !isActive && !isHovered;

            return (
              <motion.line
                key={`c-${i}`}
                x1={sx(seg[0].x)}
                y1={sy(seg[0].y)}
                x2={sx(seg[1].x)}
                y2={sy(seg[1].y)}
                stroke={color}
                strokeWidth={isHovered || isActive ? 3.5 : 2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: isDimmed ? 0.18 : isHovered || isActive ? 1 : 0.9,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + i * 0.08,
                  ease: "easeOut",
                }}
                onMouseEnter={() => setHoveredConstraint(i)}
                onMouseLeave={() => setHoveredConstraint(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {/* Iso-Z level curve */}
          {isoSegment && (
            <g>
              <line
                x1={sx(isoSegment[0].x)}
                y1={sy(isoSegment[0].y)}
                x2={sx(isoSegment[1].x)}
                y2={sy(isoSegment[1].y)}
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="6 5"
                strokeLinecap="round"
                opacity={0.95}
              />
              <text
                x={
                  sx((isoSegment[0].x + isoSegment[1].x) / 2) +
                  10
                }
                y={sy((isoSegment[0].y + isoSegment[1].y) / 2) - 8}
                className="fill-amber-700 text-[11px] font-mono font-bold dark:fill-amber-300"
              >
                Z = {zLevel.toFixed(2)}
              </text>
            </g>
          )}

          {/* Axes */}
          <line
            x1={0}
            y1={innerH}
            x2={innerW + 8}
            y2={innerH}
            className="stroke-zinc-500"
            strokeWidth={1.5}
            markerEnd="url(#arrow)"
          />
          <line
            x1={0}
            y1={innerH}
            x2={0}
            y2={-8}
            className="stroke-zinc-500"
            strokeWidth={1.5}
            markerEnd="url(#arrow)"
          />

          {/* Tick labels */}
          <g className="fill-zinc-500 text-[11px] font-medium">
            {xTicks.map((t) =>
              t === 0 ? null : (
                <text
                  key={`xt-${t}`}
                  x={sx(t)}
                  y={innerH + 16}
                  textAnchor="middle"
                >
                  {t}
                </text>
              ),
            )}
            {yTicks.map((t) =>
              t === 0 ? null : (
                <text key={`yt-${t}`} x={-8} y={sy(t) + 4} textAnchor="end">
                  {t}
                </text>
              ),
            )}
            <text x={-8} y={innerH + 16} textAnchor="end">
              0
            </text>
          </g>

          {/* Axis labels */}
          <text
            x={innerW + 18}
            y={innerH + 4}
            className="fill-zinc-700 text-[13px] font-semibold italic dark:fill-zinc-300"
          >
            x₁
          </text>
          <text
            x={-18}
            y={-14}
            className="fill-zinc-700 text-[13px] font-semibold italic dark:fill-zinc-300"
          >
            x₂
          </text>

          {/* Vertices */}
          {solution.vertices.map((v, i) => {
            const optimal = isOptimal(v);
            const alt = isAlternateOptimal(v);
            const hovered = hoveredVertex === i;
            return (
              <g
                key={`v-${i}`}
                onMouseEnter={() => setHoveredVertex(i)}
                onMouseLeave={() => setHoveredVertex(null)}
                style={{ cursor: "pointer" }}
              >
                {(optimal || alt) && (
                  <motion.circle
                    cx={sx(v.x1)}
                    cy={sy(v.x2)}
                    r={14}
                    fill={optimal ? "#facc15" : "#fbbf2466"}
                    fillOpacity={0.35}
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    filter="url(#optimal-glow)"
                  />
                )}
                <motion.circle
                  cx={sx(v.x1)}
                  cy={sy(v.x2)}
                  r={optimal ? 7 : alt ? 6 : 5}
                  fill={optimal ? "#eab308" : alt ? "#f59e0b" : "white"}
                  stroke={optimal ? "#a16207" : alt ? "#b45309" : "#3f3f46"}
                  strokeWidth={2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.4 + i * 0.05 }}
                />
                <text
                  x={sx(v.x1) + 12}
                  y={sy(v.x2) - 10}
                  className={
                    optimal
                      ? "fill-amber-700 text-xs font-bold dark:fill-amber-300"
                      : "fill-zinc-800 text-xs font-semibold dark:fill-zinc-200"
                  }
                >
                  {vertexLetter(i)}
                  {optimal ? " ★" : alt ? " ☆" : ""}
                </text>
                {hovered && (
                  <g>
                    <rect
                      x={sx(v.x1) + 10}
                      y={sy(v.x2) + 4}
                      width={130}
                      height={42}
                      rx={6}
                      className="fill-zinc-900/95 dark:fill-zinc-100/95"
                    />
                    <text
                      x={sx(v.x1) + 18}
                      y={sy(v.x2) + 20}
                      className="fill-white text-[11px] font-mono dark:fill-zinc-900"
                    >
                      ({v.x1.toFixed(3)}, {v.x2.toFixed(3)})
                    </text>
                    <text
                      x={sx(v.x1) + 18}
                      y={sy(v.x2) + 36}
                      className="fill-white text-[11px] font-mono dark:fill-zinc-900"
                    >
                      Z = {v.z.toFixed(3)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Legend */}
        <g transform={`translate(${width - PADDING.right + 16}, ${PADDING.top})`}>
          <text
            x={0}
            y={0}
            className="fill-zinc-700 text-[11px] font-semibold uppercase tracking-wider dark:fill-zinc-300"
          >
            Restricciones
          </text>
          {problem.constraints.map((c, i) => {
            const isActive = hoveredActiveSet?.has(i) ?? false;
            return (
              <g key={`legend-${i}`} transform={`translate(0, ${22 + i * 22})`}>
                <line
                  x1={0}
                  x2={20}
                  y1={6}
                  y2={6}
                  stroke={CONSTRAINT_COLORS[i % CONSTRAINT_COLORS.length]}
                  strokeWidth={isActive ? 4 : 3}
                  strokeLinecap="round"
                />
                <text
                  x={28}
                  y={10}
                  className={
                    isActive
                      ? "fill-zinc-900 text-[11px] font-bold dark:fill-zinc-50"
                      : "fill-zinc-700 text-[11px] dark:fill-zinc-300"
                  }
                >
                  {c.label || `R${i + 1}`}
                </text>
              </g>
            );
          })}
          {showIsoZ && (
            <g
              transform={`translate(0, ${22 + problem.constraints.length * 22 + 14})`}
            >
              <line
                x1={0}
                x2={20}
                y1={6}
                y2={6}
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="4 3"
                strokeLinecap="round"
              />
              <text
                x={28}
                y={10}
                className="fill-amber-700 text-[11px] font-semibold dark:fill-amber-300"
              >
                Línea de Z
              </text>
            </g>
          )}
        </g>
      </svg>

      {/* Iso-Z slider — pedagogical level curve control */}
      {showIsoZ && zRange && (
        <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label
              htmlFor="iso-z-slider"
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Línea de nivel · deslizá para ver moverse Z
            </label>
            <span className="font-mono text-base font-bold text-amber-600 tabular-nums dark:text-amber-400">
              Z = {zLevel.toFixed(3)}
            </span>
          </div>
          <input
            id="iso-z-slider"
            type="range"
            min={zRange.zMin}
            max={zRange.zMax}
            step={(zRange.zMax - zRange.zMin) / 400}
            value={zLevel}
            onChange={(e) => setZLevel(Number(e.target.value))}
            className="iso-z-slider w-full"
            aria-label="Nivel de la función objetivo Z"
          />
          <div className="mt-1.5 flex justify-between font-mono text-[10px] tabular-nums text-zinc-400">
            <span>{zRange.zMin.toFixed(1)}</span>
            <button
              type="button"
              onClick={() => setZLevel(zRange.optimal)}
              className="rounded px-1 hover:text-amber-600 dark:hover:text-amber-400"
              title="Volver al óptimo"
            >
              óptimo {zRange.optimal.toFixed(2)} ↺
            </button>
            <span>{zRange.zMax.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
