"use client";

import { CONSTRAINT_COLORS } from "@/lib/colors";
import {
  Constraint,
  EXAMPLES,
  Inequality,
  Objective,
  ObjectiveType,
  Problem,
} from "@/lib/solver";

import { NumberField } from "./NumberField";

interface Props {
  problem: Problem;
  onChange: (p: Problem) => void;
}

export function InputPanel({ problem, onChange }: Props) {
  const setObjective = (o: Objective) => onChange({ ...problem, objective: o });
  const setConstraints = (cs: Constraint[]) =>
    onChange({ ...problem, constraints: cs });

  const updateConstraint = (i: number, patch: Partial<Constraint>) => {
    const next = [...problem.constraints];
    next[i] = { ...next[i], ...patch };
    setConstraints(next);
  };

  const addConstraint = () => {
    setConstraints([
      ...problem.constraints,
      { a1: 1, a2: 1, op: "<=", b: 1, label: "" },
    ]);
  };

  const removeConstraint = (i: number) => {
    setConstraints(problem.constraints.filter((_, j) => j !== i));
  };

  const loadExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (ex) onChange(ex.problem);
  };

  const clearAll = () =>
    onChange({
      objective: { type: "max", c1: 1, c2: 1 },
      constraints: [],
    });

  return (
    <aside className="space-y-5">
      {/* Función objetivo */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Función objetivo
        </h2>

        <SegmentedControl
          value={problem.objective.type}
          options={[
            { value: "max", label: "Maximizar" },
            { value: "min", label: "Minimizar" },
          ]}
          onChange={(v) =>
            setObjective({ ...problem.objective, type: v as ObjectiveType })
          }
        />

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          <span className="font-mono italic text-zinc-500">Z =</span>
          <NumberField
            ariaLabel="Coeficiente c1"
            value={problem.objective.c1}
            onChange={(c1) => setObjective({ ...problem.objective, c1 })}
            className={coefInputClass}
          />
          <span className="font-mono italic">x₁ +</span>
          <NumberField
            ariaLabel="Coeficiente c2"
            value={problem.objective.c2}
            onChange={(c2) => setObjective({ ...problem.objective, c2 })}
            className={coefInputClass}
          />
          <span className="font-mono italic">x₂</span>
        </div>
      </section>

      {/* Restricciones */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Restricciones
          </h2>
          <span className="text-xs text-zinc-400">
            {problem.constraints.length} activa
            {problem.constraints.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-3">
          {problem.constraints.length === 0 && (
            <p className="rounded-md bg-zinc-50 px-3 py-4 text-center text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              Sin restricciones — agregá al menos una.
            </p>
          )}

          {problem.constraints.map((c, i) => {
            const color = CONSTRAINT_COLORS[i % CONSTRAINT_COLORS.length];
            return (
              <div
                key={i}
                className="rounded-lg border border-zinc-200 bg-zinc-50/40 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                  <input
                    type="text"
                    value={c.label ?? ""}
                    onChange={(e) =>
                      updateConstraint(i, { label: e.target.value })
                    }
                    placeholder={`Restricción ${i + 1}`}
                    className="flex-1 bg-transparent text-sm font-medium text-zinc-700 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeConstraint(i)}
                    aria-label={`Eliminar restricción ${i + 1}`}
                    className="text-zinc-400 transition hover:text-rose-500"
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  <NumberField
                    ariaLabel="a1"
                    value={c.a1}
                    onChange={(a1) => updateConstraint(i, { a1 })}
                    className={coefInputClass}
                  />
                  <span className="font-mono italic">x₁ +</span>
                  <NumberField
                    ariaLabel="a2"
                    value={c.a2}
                    onChange={(a2) => updateConstraint(i, { a2 })}
                    className={coefInputClass}
                  />
                  <span className="font-mono italic">x₂</span>
                  <OpSelector
                    value={c.op}
                    onChange={(op) => updateConstraint(i, { op })}
                  />
                  <NumberField
                    ariaLabel="b"
                    value={c.b}
                    onChange={(b) => updateConstraint(i, { b })}
                    className={coefInputClass}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addConstraint}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
        >
          <PlusIcon />
          Agregar restricción
        </button>
      </section>

      {/* Ejemplos */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Ejemplos
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => loadExample(ex.id)}
              className="rounded-lg bg-zinc-100 px-3 py-2 text-left text-xs font-medium text-zinc-700 transition hover:bg-indigo-100 hover:text-indigo-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
            >
              {ex.title}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={clearAll}
          className="mt-3 w-full rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
        >
          Limpiar todo
        </button>
      </section>
    </aside>
  );
}

const coefInputClass =
  "w-12 rounded-md border border-zinc-300 bg-white px-2 py-1 text-center font-mono text-sm tabular-nums shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40";

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex w-full rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition " +
              (active
                ? "bg-white text-indigo-700 shadow-sm dark:bg-zinc-950 dark:text-indigo-300"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function OpSelector({
  value,
  onChange,
}: {
  value: Inequality;
  onChange: (op: Inequality) => void;
}) {
  const options: { value: Inequality; label: string }[] = [
    { value: "<=", label: "≤" },
    { value: ">=", label: "≥" },
    { value: "=", label: "=" },
  ];
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-label={`Operador ${o.label}`}
            className={
              "w-7 py-1 text-sm font-bold transition " +
              (active
                ? "bg-indigo-600 text-white"
                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 6h14M8 6V4a1 1 0 011-1h2a1 1 0 011 1v2m1 0v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6h8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
