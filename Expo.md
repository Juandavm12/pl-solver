# Guion de Sustentación — PL Solver

**Grupo 2 · Iterateam · Investigación de Operaciones · ITM**

Este documento es la hoja de ruta para la demostración en vivo. Está pensado para que cualquier miembro del equipo pueda guiar la demo sin perderse, con tiempos sugeridos y un plan de contingencia.

**Duración total objetivo: 8–10 minutos** (demo) + 2–3 minutos (Q&A).

---

## 0. Checklist previo a la sustentación

Hacer al menos **10 minutos antes** de la presentación:

- [ ] Browser abierto en la URL pública de Vercel y página cargada.
- [ ] Pestaña adicional con `http://localhost:3000` corriendo (`npm run dev`) como respaldo.
- [ ] Modo dispositivo del navegador en **escritorio normal** (no responsive).
- [ ] Zoom del navegador al 100% (Ctrl/Cmd + 0).
- [ ] Tema claro u oscuro elegido según la iluminación del aula (oscuro queda mejor con proyector).
- [ ] Volumen del laptop OK por si alguien pide ver una animación con sonido (no la usamos, pero por las dudas).
- [ ] El proyector / pantalla externa configurados.
- [ ] Mouse físico o trackpad confiable.
- [ ] Recargar la página y dejarla cargada en el ejemplo "Producción de muebles" como punto de partida.

---

## 1. Apertura — 60 segundos

**Quién habla**: uno de los integrantes (a definir entre el equipo).

**Qué decir (aproximadamente)**:

> "Buenos días, profesora. Somos el Grupo 2, **Iterateam**: Juan David, Paula, José David, David Fernando y Luz Mallely. Elegimos la **Línea A** del trabajo final: Programación Lineal por el método gráfico, problemas de dos variables.
>
> Lo que vamos a mostrar es una **aplicación web** que construimos en TypeScript con Next.js. La aplicación recibe una función objetivo y un conjunto de restricciones, calcula automáticamente los vértices de la región factible y entrega la solución óptima en milisegundos. Pero lo más importante: la pensamos como una herramienta **pedagógica**, no como una calculadora ciega. Queremos que el usuario vea **por qué** el óptimo cae donde cae."

**Qué hacer en pantalla**: nada todavía — laptop con la app cargada pero sin tocar, hablar mirando a la profe.

---

## 2. Demo principal — Problema de la mueblería — 3 minutos

**Quién habla**: cualquier integrante.

### 2.1 Mostrar el modelo en la columna izquierda (15 s)

**Decir**:

> "Acá ven el primer ejemplo cargado: una mueblería que fabrica mesas y sillas. Cada mesa requiere 2 horas de carpintería y 1 hora de pintura; cada silla, 1 hora de carpintería y 3 de pintura. Disponemos de 8 horas de carpintería y 9 de pintura. La utilidad es 3 por mesa y 2 por silla. Maximizar."

**Hacer**: señalar con el cursor:
1. La función objetivo `Z = 3·x₁ + 2·x₂` arriba.
2. Las dos restricciones — Carpintería y Pintura — con el toggle `≤` ya seleccionado.

### 2.2 Mostrar el gráfico (45 s)

**Decir**:

> "A la derecha tenemos el plano cartesiano con `x₁` (mesas) en horizontal y `x₂` (sillas) en vertical. Las dos rectas de colores son las restricciones — azul es Carpintería, rosa es Pintura. El polígono sombreado es la **región factible**: todos los puntos `(x₁, x₂)` que cumplen las dos restricciones y la no negatividad.
>
> Los cuatro círculos blancos son los **vértices** de la región factible. La herramienta los etiqueta automáticamente A, B, C, D en sentido antihorario.
>
> El vértice C, marcado con halo dorado y estrella, es el **óptimo**: `(3, 2)` con `Z* = 13`. Fabricar 3 mesas y 2 sillas da la utilidad máxima de $13 diarios."

**Hacer**: pasar el mouse lentamente sobre cada vértice. Al hacer hover sobre C, mostrar el tooltip con coordenadas y Z.

### 2.3 Mostrar la tabla y el banner de resultado (15 s)

**Decir**:

> "Abajo, el panel de resultado: estado `Óptimo único` en verde, Z* destacado en ámbar a la derecha, y una tabla con los cuatro vértices, su valor de Z, y la marca de óptimo en el ganador. Esto le ahorra al estudiante revisar uno por uno la tabla a mano: la herramienta ya identificó cuál es."

**Hacer**: scrollear apenas para que se vea el panel de resultado. Señalar las filas.

### 2.4 El slider de iso-Z — momento clave (75 s)

**Decir**:

> "Acá viene la parte que más nos importa pedagógicamente. **¿Por qué el óptimo cae siempre en un vértice?** El Teorema Fundamental dice que sí, pero, ¿cómo lo "vemos"?
>
> El slider ámbar de abajo controla `k` en la ecuación `c₁·x₁ + c₂·x₂ = k`. Eso es una **familia de rectas paralelas** —las curvas de nivel de la función objetivo. Miren qué pasa cuando muevo el slider."

**Hacer**:
1. Llevar el slider a la posición mínima (extremo izquierdo). Hacer notar: "Cuando Z = 0, la recta pasa por el origen, fuera del óptimo".
2. Deslizar lentamente hacia la derecha. Hacer notar que la línea ámbar punteada se desplaza paralela a sí misma, hacia el norte-este.
3. Pararse en `Z = 13`. Hacer notar: "Justo acá, la curva de nivel TOCA el vértice C. Si la sigo moviendo..."
4. Pasar Z = 13. "...sale de la región factible. **Más allá no podemos ir porque ya no hay puntos factibles**."

**Decir**:

> "Eso es geométricamente por qué el óptimo está en un vértice: la curva de nivel se desplaza hasta que la frontera de la región factible la frena, y eso ocurre exactamente en un vértice. **Esto es lo que GeoGebra no hace** — y es lo que queremos que el estudiante entienda."

### 2.5 Hover de vértice — restricciones activas (30 s)

**Decir**:

> "Una cosita más: ¿qué restricciones forman cada vértice? Si hago hover sobre el óptimo C..."

**Hacer**: hover sobre C. Mostrar que las dos rectas (Carpintería y Pintura) se quedan brillantes mientras que las otras se atenúan, y que en la leyenda lateral los labels de las dos activas aparecen en negrita.

**Decir**:

> "...la herramienta resalta las dos restricciones que se intersectan acá. Esto le enseña al estudiante que cada vértice, en 2D, es la solución de un sistema 2×2 de dos restricciones activas."

---

## 3. Demo de semiautomatización — modificar inputs en vivo — 90 segundos

**Decir**:

> "La consigna pide **semiautomatización**: que el usuario cambie datos sin tocar código. Lo demostramos."

**Hacer**:
1. Cambiar el coeficiente `c₂` de la función objetivo de `2` a `5` (por ejemplo). Hacer notar que el gráfico, la curva de nivel y la tabla se actualizan al instante.
2. Modificar `b` de la restricción de Pintura de `9` a `15`. Hacer notar que la región factible cambia, aparecen vértices nuevos, el óptimo se mueve.
3. Tocar el botón `+ Agregar restricción`. Llenar con valores cualesquiera, mostrar que se incorpora a la solución.
4. Tocar la `X` de esa misma restricción para eliminarla.
5. Volver a tocar el ejemplo "Producción de muebles" para resetear el estado inicial.

**Decir**:

> "Toda la matemática vive en el lado del cliente, en JavaScript. No hay servidor que llamar, no hay latencia. Cualquier cambio se recalcula y se redibuja al instante."

---

## 4. Demo de casos especiales — 2 minutos

**Decir**:

> "La consigna explícitamente menciona la robustez. Toda PL puede caer en uno de cuatro escenarios. Los cubrimos todos."

### 4.1 Producción industrial (30 s)

**Hacer**: click en el ejemplo "Producción industrial".

**Decir**:

> "Los ejes auto-escalan a centenas: 800 horas de máquina, 600 horas de mano de obra. El óptimo es `(150, 100)` con Z* = 10.500 pesos. Esto demuestra que la herramienta no está acotada a valores chicos — funciona con cualquier magnitud que el usuario tipee."

### 4.2 Múltiples óptimos (30 s)

**Hacer**: click en "Múltiples óptimos".

**Decir**:

> "Cuando la función objetivo es paralela a una restricción activa, el óptimo no es un punto sino un **segmento** completo. La herramienta detecta esto: el banner ámbar avisa 'Múltiples óptimos', y la tabla destaca **dos** vértices, uno con estrella llena y otro con estrella vacía. Cualquier combinación lineal de ellos también es óptima."

### 4.3 Infactible (20 s)

**Hacer**: click en "Infactible".

**Decir**:

> "Si las restricciones son incompatibles —acá `x₁ + x₂ ≤ 2` y a la vez `x₁ + x₂ ≥ 5`— la región factible es vacía. La herramienta lo detecta por la ausencia de vértices factibles, oculta el polígono y muestra el banner rojo."

### 4.4 No acotado (30 s)

**Hacer**: click en "No acotado".

**Decir**:

> "Si la región factible se extiende indefinidamente en dirección de mejora del objetivo, no hay óptimo finito. Acá maximizamos `Z = x₁ + x₂` con sólo cotas inferiores —`x₁ ≥ 1` y `x₂ ≥ 1`— nada limita el crecimiento. La herramienta lo detecta caminando desde cada vértice y verificando si alguna dirección mejora el objetivo sin ser bloqueada. El banner violeta avisa: `Z → +∞`."

---

## 5. Cierre — qué nos diferencia — 60 segundos

**Decir**:

> "Tres puntos finales:
>
> **Uno: rigor matemático**. Todos los vértices son la solución exacta de un sistema 2×2 vía regla de Cramer. No hay aproximaciones, no hay redondeos en el motor. El script de validación que pueden ver en el repositorio resuelve **seis casos** a mano y los compara con la herramienta: pasan los seis.
>
> **Dos: arquitectura limpia**. Separamos el motor matemático —TypeScript puro, sin React, sin DOM— de la vista. Esto nos permitió desarrollar y testear el algoritmo de forma independiente, y nos da la confianza de que cualquier futuro estudiante puede leer el código del solver y entender cada paso.
>
> **Tres: enseñanza, no calculadora**. El slider de iso-Z, el resaltado de restricciones activas y los mensajes contextuales convierten a la herramienta en algo que **enseña** mientras resuelve. Esa fue nuestra apuesta principal: no competir con GeoGebra en generalidad, sino superarlo en la enseñanza específica del método gráfico.
>
> Quedamos atentos a sus preguntas. Gracias."

---

## 6. Plan de contingencia

### Si Vercel está caído o sin internet
1. Pasar a la pestaña local en `http://localhost:3000` (corriendo en el laptop).
2. Si la profesora pregunta por la URL pública: explicar que está deployada pero que aprovechamos la versión local por seguridad.

### Si el laptop local no arranca el dev server
1. Mostrar las capturas de pantalla en el README (carpeta `screenshots/`).
2. Si hay tiempo: ejecutar el script de validación `npx tsx src/lib/solver/validate.ts` desde la terminal — muestra los 6/6 PASS y prueba que el motor funciona aunque la UI no.

### Si el slider se rompe en vivo
1. Recargar la página.
2. Si persiste, mostrarlo desde una grabación de pantalla previa (recomendado: grabar un video corto la noche anterior).

### Si la profesora plantea un problema imprevisto
1. **Tipearlo en vivo** — la herramienta está hecha justamente para eso. Pedirle los coeficientes y las restricciones, llenar la tabla, y mostrar el resultado en segundos.

---

## 7. Preguntas anticipadas — guion de respuestas

### "¿Por qué TypeScript y no Python?"
> La consigna admite varios lenguajes. Elegimos TypeScript porque (a) corre directo en el navegador sin servidor, (b) los tipos estáticos nos protegieron de errores matemáticos, (c) el deploy a Vercel es de un click, y (d) en una entrevista de trabajo es más demostrable que un script de Python.

### "¿Por qué no usar SciPy o algún resolvedor LP?"
> El método gráfico de 2 variables es elemental: para 2 variables, generar todas las intersecciones de pares de rectas y filtrar las factibles es operación de orden O(m²) con m pequeño. Importar un resolvedor habría sido sobre-ingeniería y oscurecido la lógica. Queríamos que el código sea didáctico.

### "¿Cómo detecta no acotamiento sin caer en bucles infinitos?"
> No simulamos el avance. Para cada vértice y cada restricción activa, calculamos analíticamente la dirección tangencial de la frontera, verificamos si esa dirección mejora el objetivo y si alguna otra restricción la bloquea. Es un cálculo cerrado en O(m³) en el peor caso, con m pequeño.

### "¿Qué pasa con problemas de 3 o más variables?"
> Esa es una limitación intrínseca del método gráfico, no de nuestra implementación. Para 3 variables hay que pasar al método Simplex algebraico, y para muchas variables a interior-point. La consigna se limita explícitamente a 2 variables, así que está fuera de alcance.

### "¿Por qué no hay análisis de sensibilidad?"
> Lo evaluamos y decidimos posponerlo. La consigna pide identificar el óptimo y mostrar los vértices, no rangos de optimalidad ni precios sombra. Preferimos invertir el tiempo restante en pulir la experiencia pedagógica del slider y los casos especiales.

### "¿Y si las restricciones tienen valores fraccionarios?"
> Los aceptamos sin problema. El motor trabaja en `number` (punto flotante doble), no en enteros. Podemos tipear `0.5`, `1.25`, etc. y la herramienta resuelve igual.

### "¿Qué pasa con problemas degenerados (más de 2 restricciones en un mismo punto)?"
> El motor lo detecta en el paso de deduplicación: si dos pares de restricciones generan el mismo punto (con tolerancia de 10⁻⁹), se fusionan en un único vértice cuya lista de restricciones activas es la unión.

---

## 8. Notas para el equipo durante la demo

- **Hablar despacio.** Es preferible quedar 30 segundos cortos que apurarse.
- **No leer el guion de corrido.** Usarlo como apoyo, no como libreto.
- **Mirar a la profesora.** El laptop ocupa la atención del 80% de las demos malas; la nuestra mira al humano que evalúa.
- **Si algo falla**, no entrar en pánico: pasar al plan B con calma. La profe valora la madurez técnica.
- **Repartir las partes** entre los cinco integrantes antes de la sustentación, para que todos hablen algo.
