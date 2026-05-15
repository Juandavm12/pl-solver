# PL Solver — Método Gráfico

**Trabajo Final · Línea A: Programación Lineal y Método Gráfico**

Herramienta web interactiva para resolver problemas de Programación Lineal de dos variables mediante el método gráfico, con visualización de la región factible, identificación automática de vértices, detección de casos especiales y curva de nivel deslizable para el análisis pedagógico de la función objetivo.

---

## Identificación

| Campo | Valor |
| --- | --- |
| **Grupo** | 2 — Iterateam |
| **Integrantes** | Juan David Velásquez Murillo · Paula Andrea Calderón Quintero · José David Vásquez Díaz · David Fernando Castro López · Luz Mallely Zapata |
| **Materia** | Investigación de Operaciones |
| **Profesora** | Laura Angélica Mejía Ospina |
| **Universidad** | Institución Universitaria ITM |
| **Línea de trabajo** | A — Programación Lineal y Método Gráfico |

---

## 1. Objetivo del proyecto

Construir una herramienta semiautomatizada que permita al usuario:

1. **Ingresar** un problema de PL de dos variables mediante formularios estructurados (sin tipear ecuaciones).
2. **Visualizar** dinámicamente la región factible, sus vértices y las restricciones que la conforman.
3. **Identificar automáticamente** la solución óptima (o detectar que el problema es infactible, no acotado o tiene múltiples óptimos).
4. **Analizar pedagógicamente** la solución a través de una línea de nivel deslizable, que muestra geométricamente por qué el óptimo cae siempre en un vértice (Teorema Fundamental de la Programación Lineal).

La herramienta cumple con todos los requisitos técnicos exigidos por la consigna: interfaz clara, motor de cálculo robusto, salida legible y semiautomatización (los datos de entrada se modifican sin tocar código).

---

## 2. Modelo matemático

### 2.1 Formulación general

Un problema de Programación Lineal de dos variables se escribe en la forma:

```
Optimizar:    Z = c₁·x₁ + c₂·x₂        (función objetivo)
Sujeto a:     aᵢ₁·x₁ + aᵢ₂·x₂  {≤, ≥, =}  bᵢ     para i = 1, ..., m
              x₁, x₂  ≥  0              (no negatividad)
```

donde **Optimizar** puede ser **Maximizar** o **Minimizar**.

Cada restricción define un semiplano en ℝ². La intersección de todos los semiplanos (incluyendo las restricciones implícitas de no negatividad) constituye la **región factible**, que es un conjunto convexo.

### 2.2 Teorema Fundamental de la Programación Lineal

> Si una solución óptima existe, entonces existe al menos un vértice (punto extremo) de la región factible que es solución óptima.

Este teorema es el pilar del método gráfico: en lugar de explorar infinitos puntos del interior de la región, basta con **evaluar la función objetivo Z en cada vértice** y seleccionar el que cumple el criterio de optimización.

### 2.3 Casos posibles de la solución

Toda PL de dos variables cae en uno de los siguientes cuatro escenarios:

| Estado | Caracterización geométrica | Significado |
| --- | --- | --- |
| **Óptimo único** | La región factible es un polígono cerrado y la función objetivo alcanza su valor extremo en un único vértice. | Existe una solución única `(x₁*, x₂*)` que optimiza Z. |
| **Óptimos múltiples** | La función objetivo es paralela a una de las aristas activas en el óptimo. | Existen infinitas soluciones óptimas: todo el segmento que une dos vértices adyacentes (con el mismo Z*) es óptimo. |
| **Infactible** | La intersección de los semiplanos es vacía. | No existe ningún `(x₁, x₂)` que satisfaga simultáneamente todas las restricciones. |
| **No acotado** | La región factible se extiende indefinidamente en la dirección de mejora del objetivo. | El valor óptimo de Z tiende a +∞ (max) o −∞ (min); no existe óptimo finito. |

La herramienta detecta automáticamente cada uno de estos cuatro escenarios y los presenta al usuario con mensajes contextuales y código de color (verde, ámbar, rojo y violeta respectivamente).

---

## 3. Lógica de programación — el motor de cálculo

El motor de resolución está implementado en TypeScript puro, sin dependencias matemáticas externas (no se usan resolvedores tipo SciPy, GLPK o similares). La elección es deliberada: para problemas de dos variables, la enumeración de vértices es elemental, transparente y permite explicar el método paso a paso.

### 3.1 Algoritmo de enumeración de vértices

El procedimiento sigue ocho pasos bien definidos:

```
PASO 1.  Aumentar las restricciones del usuario con las implícitas
         x₁ ≥ 0 y x₂ ≥ 0.

PASO 2.  Para cada par de restricciones (Cᵢ, Cⱼ), tratadas como
         igualdades, resolver el sistema lineal 2×2 por la regla
         de Cramer:

              | aᵢ₁  aᵢ₂ |   | x₁ |   | bᵢ |
              | aⱼ₁  aⱼ₂ | · | x₂ | = | bⱼ |

         Si el determinante es cero, las rectas son paralelas → no
         hay intersección.

PASO 3.  Filtrar las intersecciones obtenidas, conservando únicamente
         las que satisfacen TODAS las restricciones (con tolerancia
         ε = 10⁻⁹). Las que pasan el filtro son los VÉRTICES de la
         región factible.

PASO 4.  Deduplicar puntos coincidentes (caso degenerado donde tres o
         más restricciones se cortan en el mismo punto), fusionando
         sus listas de restricciones activas.

PASO 5.  Si no quedó ningún vértice → INFACTIBLE.

PASO 6.  Test de no acotamiento: desde cada vértice, caminar a lo
         largo de la frontera de cada restricción activa en ambas
         direcciones. Si alguna de esas direcciones (a) mejora el
         objetivo y (b) no es bloqueada por ninguna otra restricción,
         la región es NO ACOTADA.

PASO 7.  Ordenar los vértices angularmente alrededor del centroide
         (sentido antihorario) — necesario para dibujar el polígono
         cerrado.

PASO 8.  Evaluar Z en cada vértice y seleccionar el de mayor (max)
         o menor (min) valor. Si existe otro vértice con el mismo
         Z óptimo, el resultado son MÚLTIPLES ÓPTIMOS sobre la
         arista que los une.
```

### 3.2 Detección de no acotamiento (paso 6, detallado)

Una restricción `aᵢ₁·x₁ + aᵢ₂·x₂ = bᵢ` define una recta cuya dirección tangencial es `(−aᵢ₂, aᵢ₁)` (o su opuesta). Desde un vértice `V` con restricción `Cᵢ` activa, podemos avanzar a lo largo de esa recta. Para cada dirección candidata `d = (d₁, d₂)`:

- El avance **mejora el objetivo** si `c₁·d₁ + c₂·d₂ > 0` (maximización) o `< 0` (minimización).
- El avance **no es bloqueado** si para toda otra restricción `Cₖ`, la tasa `aₖ₁·d₁ + aₖ₂·d₂` es compatible con su signo (no positiva para `≤`, no negativa para `≥`, cero para `=`).

Si existe al menos una dirección que cumple ambas condiciones, el problema es no acotado en sentido del objetivo.

### 3.3 Detección de óptimos múltiples (paso 8, detallado)

Después de ordenar los vértices por Z (en sentido de optimización), se comparan los dos primeros: si la diferencia `|Z₁ − Z₂| < ε`, ambos son óptimos y el segmento que los une también lo es, dado que la función objetivo es lineal y la región factible es convexa.

---

## 4. Arquitectura del software

### 4.1 Stack tecnológico

| Capa | Tecnología | Razón |
| --- | --- | --- |
| Lenguaje | TypeScript 5 | Tipos estáticos previenen bugs matemáticos |
| Framework | Next.js 16 (App Router) | Build optimizado y deploy de un click en Vercel |
| Vista | React 19 + SVG nativo + `d3-scale` | Renderizado declarativo con control fino del gráfico |
| Estilo | Tailwind CSS 4 | Diseño consistente sin overhead |
| Animaciones | `motion` (sucesor de Framer Motion) | Transiciones suaves del gráfico |
| Runtime | Node.js 18+ (dev), navegador (prod) | El motor corre íntegramente en el cliente |

### 4.2 Estructura de carpetas

```
pl-solver/
├── src/
│   ├── lib/
│   │   ├── colors.ts             Paleta de colores de las restricciones
│   │   └── solver/
│   │       ├── types.ts          Tipos: Problem, Constraint, Solution
│   │       ├── geometry.ts       Intersección, factibilidad, ordenamiento
│   │       ├── solver.ts         Función solve() — motor principal
│   │       ├── examples.ts       6 problemas pre-cargados
│   │       ├── validate.ts       Script de validación (npx tsx)
│   │       └── index.ts          Barrel exports
│   ├── components/
│   │   ├── ThemeToggle.tsx       Conmutador claro/oscuro
│   │   ├── graph/
│   │   │   ├── GraphView.tsx     Componente SVG completo
│   │   │   └── viewport.ts       Cálculo dinámico del viewport
│   │   ├── input/
│   │   │   ├── InputPanel.tsx    Editor de objetivo + restricciones
│   │   │   └── NumberField.tsx   Input numérico controlado
│   │   └── results/
│   │       └── ResultsPanel.tsx  Banner de estado + tabla de vértices
│   └── app/
│       ├── layout.tsx            Root layout con detección de tema
│       ├── globals.css           Tailwind + dark mode class-based
│       └── page.tsx              Orquestador (estado + render)
└── README.md                     Este documento
```

### 4.3 Separación de responsabilidades

El proyecto sigue una arquitectura limpia con tres capas:

1. **Motor (`src/lib/solver/`)** — Lógica matemática pura, sin React, sin DOM. Cubierta por un script de validación que verifica seis casos resueltos a mano. Se podría reusar en cualquier otro entorno (Node, Deno, otro framework).
2. **Componentes (`src/components/`)** — Vistas React que consumen los tipos del motor y emiten cambios al estado del padre. Stateless en la medida de lo posible.
3. **Aplicación (`src/app/`)** — Capa de orquestación: mantiene el estado del problema y propaga la solución calculada a los componentes.

---

## 5. Caso de prueba — Problema de la mueblería

### 5.1 Enunciado

Una pequeña carpintería fabrica **mesas (`x₁`)** y **sillas (`x₂`)**. Cada mesa requiere 2 horas de carpintería y 1 hora de pintura; cada silla requiere 1 hora de carpintería y 3 horas de pintura. Se dispone de 8 horas de carpintería y 9 horas de pintura por día. La utilidad por mesa es de $3 y por silla $2. Se desea **maximizar la utilidad diaria**.

### 5.2 Modelo

```
Maximizar    Z = 3·x₁ + 2·x₂
Sujeto a:    2·x₁ + 1·x₂  ≤  8     (Carpintería)
             1·x₁ + 3·x₂  ≤  9     (Pintura)
             x₁, x₂  ≥  0
```

### 5.3 Resolución a mano (para validar la herramienta)

**Vértices candidatos**: intersecciones de pares de rectas.

| Intersección | Sistema | Punto | ¿Factible? | Z = 3x₁ + 2x₂ |
| --- | --- | --- | :---: | --- |
| Carpintería ∩ Pintura | `2x₁+x₂=8` y `x₁+3x₂=9` | (3, 2) | Sí | **13** |
| Carpintería ∩ Eje x₁ | `2x₁+x₂=8` y `x₂=0` | (4, 0) | Sí | 12 |
| Pintura ∩ Eje x₂ | `x₁+3x₂=9` y `x₁=0` | (0, 3) | Sí | 6 |
| Origen | `x₁=0` y `x₂=0` | (0, 0) | Sí | 0 |
| Carpintería ∩ Eje x₂ | `2x₁+x₂=8` y `x₁=0` | (0, 8) | No (viola Pintura) | — |
| Pintura ∩ Eje x₁ | `x₁+3x₂=9` y `x₂=0` | (9, 0) | No (viola Carpintería) | — |

**Conclusión**: El óptimo se encuentra en `(x₁, x₂) = (3, 2)` con `Z* = 13`. Se deben fabricar 3 mesas y 2 sillas diarias para maximizar la utilidad.

### 5.4 Resultado de la herramienta

La herramienta resuelve este problema en milisegundos y reporta:

- **Estado**: `optimal`
- **Vértice óptimo**: `(3.0000, 2.0000)` con `Z* = 13.0000`
- **Vértices identificados**: 4 — `A(0,0)`, `B(4,0)`, `C(3,2)★`, `D(0,3)`

> **[Captura 1 — `screenshots/01-produccion-muebles.png`]** — Vista completa con la región factible sombreada, los cuatro vértices marcados, el vértice óptimo C resaltado con halo dorado y la curva de nivel `Z = 13` superpuesta al óptimo.

### 5.5 Validación con casos especiales

Para garantizar la robustez del motor, se validaron cinco casos adicionales que ejercitan cada rama del algoritmo. La verificación se ejecuta con:

```bash
npx tsx src/lib/solver/validate.ts
```

Resultados (todos pasan):

| # | Caso | Resultado esperado | Estado |
| --- | --- | --- | --- |
| 1 | Producción de muebles | Óptimo (3, 2), Z* = 13 | **PASS** |
| 2 | Problema de la dieta (min) | Óptimo (2, 2), Z* = 14 | **PASS** |
| 3 | Múltiples óptimos | Z* = 16 entre (0, 4) y (4, 2) | **PASS** |
| 4 | Infactible | Sin región factible | **PASS** |
| 5 | No acotado | Z → +∞ | **PASS** |
| 6 | Producción industrial (números grandes) | Óptimo (150, 100), Z* = 10.500 | **PASS** |

> **[Captura 2 — `screenshots/02-industrial-numeros-grandes.png`]** — Caso "Producción industrial" con restricciones de 800 h de máquina y 600 h de mano de obra; los ejes auto-escalan a 0–500 y el óptimo se ubica en (150, 100) con Z* = 10.500. Evidencia que la herramienta no está acotada a valores chicos.

> **[Captura 3 — `screenshots/03-iso-z-slider.png`]** — Curva de nivel deslizable: al mover el slider ámbar, la línea punteada `Z = k` se desplaza paralela a sí misma sobre el gráfico, ilustrando el Teorema Fundamental.

> **[Captura 4 — `screenshots/04-infactible.png`]** — Caso infactible: dos restricciones incompatibles (`x₁+x₂ ≤ 2` y `x₁+x₂ ≥ 5`). La herramienta muestra el banner rojo "Infactible" y omite el gráfico de región.

> **[Captura 5 — `screenshots/05-no-acotado.png`]** — Caso no acotado: maximizar `Z = x₁ + x₂` sólo con `x₁ ≥ 1`, `x₂ ≥ 1`. Banner violeta "No acotado", indicando que Z → +∞.

> **[Captura 6 — `screenshots/06-multiples-optimos.png`]** — Caso de óptimos múltiples: la función objetivo es paralela a una restricción activa. La tabla destaca dos vértices con la misma Z* (uno marcado con ★, otro con ☆).

---

## 6. Cómo correr el proyecto

### 6.1 Requisitos

- Node.js 18.18 o superior
- npm 9 o superior

### 6.2 Instalación y ejecución local

```bash
git clone <URL-DEL-REPO>
cd pl-solver
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

### 6.3 Validación del motor

```bash
npx tsx src/lib/solver/validate.ts
```

Ejecuta los seis casos de prueba y reporta `PASS` o `FAIL` por cada uno.

### 6.4 Build de producción

```bash
npm run build
npm start
```

### 6.5 Versión desplegada

**https://pl-solver.vercel.app/**

Accesible públicamente, sin login. La aplicación se sirve de forma estática desde Vercel (Hobby plan, gratuito) y se redeploya automáticamente con cada `git push origin main`.

---

## 7. Conclusiones

1. **El método gráfico es eminentemente visual** y nuestra herramienta aprovecha ese aspecto sin perder rigor matemático: cada vértice mostrado en pantalla es la solución exacta del sistema lineal 2×2 que lo define, no una aproximación numérica.

2. **La separación entre motor y vista** permitió desarrollar y validar el algoritmo de forma independiente del UI, escribiendo un script de validación reproducible con seis casos cubriendo las cuatro ramas posibles de una PL.

3. **El slider de iso-Z es la principal contribución pedagógica** del proyecto. A diferencia de herramientas genéricas como GeoGebra, nuestra aplicación permite "ver" físicamente cómo la curva de nivel barre la región factible hasta encontrar el vértice óptimo, materializando geométricamente el Teorema Fundamental.

4. **La detección automática de los cuatro escenarios** (óptimo, óptimos múltiples, infactible, no acotado) convierte la herramienta en un apoyo de diagnóstico, no sólo de cálculo: el estudiante recibe retroalimentación inmediata sobre la naturaleza del problema que planteó.

5. **Limitación reconocida**: la herramienta trabaja con dos variables; problemas de tres o más variables requieren métodos algebraicos (Simplex). Esta limitación es intrínseca al método gráfico y está señalada explícitamente en la consigna.

---

## 8. Referencias

- Hillier, F. S. & Lieberman, G. J. *Introducción a la Investigación de Operaciones*, 10ª ed., McGraw-Hill, 2015.
- Taha, H. A. *Investigación de Operaciones*, 10ª ed., Pearson, 2017.
- Anderson, D. R., Sweeney, D. J. & Williams, T. A. *An Introduction to Management Science: Quantitative Approaches to Decision Making*, 14ª ed., Cengage, 2016.
- Dantzig, G. B. (1963). *Linear Programming and Extensions*. Princeton University Press.

---

## 9. Estado del proyecto

| Entregable | Estado |
| --- | --- |
| Motor de cálculo validado | Completo (6/6 PASS) |
| Interfaz semiautomatizada | Completo |
| Visualización de región factible y vértices | Completo |
| Detección de casos especiales | Completo |
| Slider pedagógico (iso-Z) | Completo |
| Modo claro / oscuro | Completo |
| Build de producción | Completo (4 páginas estáticas) |
| Informe técnico | Este documento |
| Deploy público | Completo — https://pl-solver.vercel.app/ |
| Capturas de prueba | `[A INCLUIR EN /screenshots]` |

---

**Fecha de entrega**: `[POR COMPLETAR]`
