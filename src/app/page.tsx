"use client";

import { useMemo, useState } from "react";

import { GraphView } from "@/components/graph/GraphView";
import { InputPanel } from "@/components/input/InputPanel";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EXAMPLES, Problem, solve } from "@/lib/solver";

export default function Home() {
  const [problem, setProblem] = useState<Problem>(EXAMPLES[0].problem);
  const solution = useMemo(() => solve(problem), [problem]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-10 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Investigación de Operaciones · Línea A
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Programación Lineal — Método Gráfico
            </h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
              Editá la función objetivo y las restricciones. El gráfico, los
              vértices y la línea de nivel Z se actualizan en vivo.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <InputPanel problem={problem} onChange={setProblem} />

          <div className="space-y-6">
            <div className="flex justify-center">
              <GraphView problem={problem} solution={solution} />
            </div>
            <ResultsPanel solution={solution} />
          </div>
        </div>
      </div>
    </main>
  );
}
