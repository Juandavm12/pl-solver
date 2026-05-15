"use client";

import { Solution } from "@/lib/solver";

interface Props {
  solution: Solution;
}

export function ResultsPanel({ solution }: Props) {
  const statusInfo = STATUS_INFO[solution.status];

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Resultado
          </h2>
          <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.chipClass}`}>
            <span aria-hidden>{statusInfo.icon}</span>
            {statusInfo.label}
          </div>
        </div>

        {solution.optimal && (
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Z* óptimo
            </p>
            <p className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {solution.optimal.z.toFixed(4)}
            </p>
            <p className="text-xs font-mono text-zinc-500 tabular-nums">
              en (x₁, x₂) = ({solution.optimal.x1.toFixed(3)},{" "}
              {solution.optimal.x2.toFixed(3)})
            </p>
          </div>
        )}
      </div>

      <p className={`mt-4 rounded-lg px-4 py-3 text-sm ${statusInfo.bannerClass}`}>
        {solution.message}
      </p>

      {solution.vertices.length > 0 && (
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4 font-medium">Vértice</th>
              <th className="py-2 pr-4 font-medium tabular-nums">x₁</th>
              <th className="py-2 pr-4 font-medium tabular-nums">x₂</th>
              <th className="py-2 pr-4 font-medium tabular-nums">Z</th>
              <th className="py-2 pr-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {solution.vertices.map((v, i) => {
              const isOptimal =
                solution.optimal &&
                Math.abs(v.x1 - solution.optimal.x1) < 1e-6 &&
                Math.abs(v.x2 - solution.optimal.x2) < 1e-6;
              const isAlternate =
                solution.alternateOptimal &&
                Math.abs(v.x1 - solution.alternateOptimal.x1) < 1e-6 &&
                Math.abs(v.x2 - solution.alternateOptimal.x2) < 1e-6;
              return (
                <tr
                  key={i}
                  className={
                    isOptimal
                      ? "border-b border-zinc-100 bg-amber-50/60 font-semibold dark:border-zinc-800/60 dark:bg-amber-950/30"
                      : "border-b border-zinc-100 dark:border-zinc-800/60"
                  }
                >
                  <td className="py-2 pr-4 font-mono">
                    {String.fromCharCode(65 + i)}
                  </td>
                  <td className="py-2 pr-4 font-mono tabular-nums">
                    {v.x1.toFixed(3)}
                  </td>
                  <td className="py-2 pr-4 font-mono tabular-nums">
                    {v.x2.toFixed(3)}
                  </td>
                  <td className="py-2 pr-4 font-mono tabular-nums">
                    {v.z.toFixed(3)}
                  </td>
                  <td className="py-2 pr-4">
                    {isOptimal ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        ★ Óptimo
                      </span>
                    ) : isAlternate ? (
                      <span className="text-amber-500 dark:text-amber-500">
                        ☆ Óptimo alterno
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

const STATUS_INFO: Record<
  Solution["status"],
  { label: string; icon: string; chipClass: string; bannerClass: string }
> = {
  optimal: {
    label: "Óptimo único",
    icon: "✓",
    chipClass:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    bannerClass:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
  },
  "multiple-optimal": {
    label: "Múltiples óptimos",
    icon: "≡",
    chipClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    bannerClass:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
  },
  infeasible: {
    label: "Infactible",
    icon: "✕",
    chipClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    bannerClass:
      "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200",
  },
  unbounded: {
    label: "No acotado",
    icon: "∞",
    chipClass:
      "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
    bannerClass:
      "bg-violet-50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-200",
  },
};
