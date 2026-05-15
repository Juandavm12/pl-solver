import { EXAMPLES } from "./examples";
import { solve } from "./solver";

const round = (n: number) => Math.round(n * 10000) / 10000;

console.log("═══════════════════════════════════════════════════════════════════");
console.log("  VALIDACIÓN DEL MOTOR DE PROGRAMACIÓN LINEAL — Método Gráfico");
console.log("═══════════════════════════════════════════════════════════════════\n");

let pass = 0;
let fail = 0;

for (const ex of EXAMPLES) {
  console.log(`▶ ${ex.title}`);
  console.log(`  ${ex.description}`);
  console.log(`  Esperado: ${ex.expected}`);

  const sol = solve(ex.problem);
  console.log(`  Status:   ${sol.status}`);

  if (sol.optimal) {
    console.log(
      `  Óptimo:   (${round(sol.optimal.x1)}, ${round(sol.optimal.x2)}) con Z = ${round(sol.optimal.z)}`,
    );
  }
  if (sol.alternateOptimal) {
    console.log(
      `  Alterno:  (${round(sol.alternateOptimal.x1)}, ${round(sol.alternateOptimal.x2)}) con Z = ${round(sol.alternateOptimal.z)}`,
    );
  }
  console.log(`  Vértices: ${sol.vertices.length}`);
  for (const v of sol.vertices) {
    console.log(
      `    - (${round(v.x1)}, ${round(v.x2)})  Z = ${round(v.z)}  activas = [${v.activeConstraints.join(",")}]`,
    );
  }
  console.log(`  Mensaje:  ${sol.message}`);

  // Heurística de validación rápida sobre los casos conocidos
  let ok = true;
  switch (ex.id) {
    case "production":
      ok =
        sol.status === "optimal" &&
        Math.abs((sol.optimal?.x1 ?? -1) - 3) < 1e-6 &&
        Math.abs((sol.optimal?.x2 ?? -1) - 2) < 1e-6 &&
        Math.abs((sol.optimalValue ?? -1) - 13) < 1e-6;
      break;
    case "diet":
      ok =
        sol.status === "optimal" &&
        Math.abs((sol.optimal?.x1 ?? -1) - 2) < 1e-6 &&
        Math.abs((sol.optimal?.x2 ?? -1) - 2) < 1e-6 &&
        Math.abs((sol.optimalValue ?? -1) - 14) < 1e-6;
      break;
    case "multiple":
      ok =
        sol.status === "multiple-optimal" &&
        Math.abs((sol.optimalValue ?? -1) - 16) < 1e-6;
      break;
    case "infeasible":
      ok = sol.status === "infeasible";
      break;
    case "unbounded":
      ok = sol.status === "unbounded";
      break;
    case "industrial":
      ok =
        sol.status === "optimal" &&
        Math.abs((sol.optimal?.x1 ?? -1) - 150) < 1e-6 &&
        Math.abs((sol.optimal?.x2 ?? -1) - 100) < 1e-6 &&
        Math.abs((sol.optimalValue ?? -1) - 10500) < 1e-6;
      break;
  }

  if (ok) {
    console.log("  ✓ PASS\n");
    pass++;
  } else {
    console.log("  ✗ FAIL\n");
    fail++;
  }
}

console.log("═══════════════════════════════════════════════════════════════════");
console.log(`  Total: ${pass + fail}    ✓ Pass: ${pass}    ✗ Fail: ${fail}`);
console.log("═══════════════════════════════════════════════════════════════════");

if (fail > 0) process.exit(1);
