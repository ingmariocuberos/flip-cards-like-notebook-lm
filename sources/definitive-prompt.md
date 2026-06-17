# Prompt definitivo — Generación de tarjetas didácticas (libro completo)

Genera tarjetas didácticas basadas **estrictamente** en la fuente proporcionada (`sources/04 Willkommen El aleman a su alcance Vaughan.pdf`), cubriendo **las 3 Sektionen completas del libro en un solo encargo**.

## Entregable

Tres archivos JSON, uno por Sektion, en estas rutas exactas:

- `src/data/willkommen-vaughan/sektion-1.json`
- `src/data/willkommen-vaughan/sektion-2.json`
- `src/data/willkommen-vaughan/sektion-3.json`

Cada archivo debe seguir **al pie de la letra** el esquema descrito al final de este prompt. Si el `bookId`, los `sektionId` o los `id` de las tarjetas ya existían de una corrida previa, **mantén los mismos slugs** — `localStorage` depende de ellos para conservar el progreso del usuario.

---

## Procedimiento obligatorio (en este orden)

### Paso 1 — Mapear las 3 Sektionen del libro

Antes de generar nada, recorre el PDF con `Read pages:` en bloques pequeños (máx. 20 páginas por llamada) para localizar:

- Dónde empieza y termina **cada Sektion** (rango de páginas).
- Dónde empieza y termina **cada Lektion** y **cada Aspekt** dentro de cada Sektion.
- Dónde están los cuadros de texto, márgenes y actividades especiales (p. ej. *El infierno de los plurales*, *Ponte en forma*, *¡Eco!*).

Reporta este mapeo brevemente al usuario antes de continuar, en formato:

```
Sektion 1: páginas X–Y  (Lektionen 1.1, 1.2, …)
Sektion 2: páginas X–Y  (Lektionen 2.1, 2.2, …)
Sektion 3: páginas X–Y  (Lektionen 3.1, 3.2, …)
```

> **Crítico:** No mezcles contenido entre Sektionen. Cada oración o regla solo va en el JSON de la Sektion donde aparece físicamente en el libro.

### Paso 2 — Inventario exhaustivo de oraciones (por Sektion, una a la vez)

Antes de redactar tarjetas de la Sektion N:

1. Recorre todas las páginas de esa Sektion en bloques pequeños.
2. **Haz un inventario literal de TODAS las oraciones bilingües español/alemán que aparezcan en la Sektion**, incluyendo:
   - Las que están en cuerpos de texto principal.
   - Las que están en tablas o listas de vocabulario con frase de ejemplo.
   - Las que aparecen en los márgenes y cuadros de texto.
   - Las de las actividades especiales (*El infierno de los plurales*, *Ponte en forma*, *¡Eco!*, etc.).
3. Numera el inventario para tenerlo trazable: `[S1-001] ES: … / DE: …`.

Solo después de tener el inventario completo procede al Paso 3.

> Este paso es donde históricamente se han saltado oraciones. **No improvises** ni resumas: el conteo final del usuario tiene que cuadrar contra este inventario.

### Paso 3 — Generación de tarjetas

Para cada Sektion, las tarjetas se producen con **tres enfoques** complementarios. Todas viven en el mismo array `cards` del JSON de esa Sektion.

#### A) Traducción Directa (cobertura total del inventario)

Una tarjeta por cada oración del inventario del Paso 2:

- **`front`**: la frase en **español** tal como aparece en el libro.
- **`back`**: la traducción al **alemán** exacta del libro.
- **No inventes traducciones.** Si una oración aparece solo en alemán o solo en español, **no la incluyas** en este enfoque (sí podría caber en el enfoque pedagógico si ilustra una regla).

`id` sugerido: `s{N}-t{NNN}` (t de "translation"), correlativo con el inventario.

#### B) Enfoque Pedagógico / Didáctico

Tarjetas sobre el contenido explicativo de la Sektion:

- Reglas gramaticales (p. ej. caso acusativo, declinaciones, conjugaciones).
- Consejos de fonética y pronunciación.
- Términos clave y vocabulario marcado como importante.
- Errores comunes señalados por el libro (suelen aparecer en cuadros laterales).

Formato:
- **`front`**: la pregunta o concepto (p. ej. *"¿Cuándo se usa el caso acusativo?"*, *"¿Cómo se pronuncia el dígrafo 'ch' después de a/o/u?"*).
- **`back`**: la explicación tal como la da el libro, incluyendo ejemplos si los trae.

`id` sugerido: `s{N}-g{NNN}` (g de "grammar/grundlagen").

#### C) Ejercicios Prácticos

Una tarjeta por cada ítem reutilizable de las actividades especiales (*El infierno de los plurales*, *Ponte en forma*, *¡Eco!*, etc.):

- **`front`**: el enunciado o estímulo del ejercicio.
- **`back`**: la respuesta correcta según el libro (no la inventes; si el libro no la da explícitamente, omite la tarjeta).

`id` sugerido: `s{N}-u{NNN}` (u de "übung").

### Paso 4 — Escribir los 3 JSON

Escribe los archivos en las rutas indicadas. Cada uno debe ser **JSON puro** (sin comentarios, sin trailing commas) y validar contra el esquema de abajo. Mantén los `id` estables y consecutivos dentro de su prefijo.

### Paso 5 — Reporte final al usuario

Al terminar, entrega un resumen con esta forma exacta:

```
Sektion 1
  · Traducción Directa:  X tarjetas  (inventario detectado: X)
  · Pedagógico:           Y tarjetas
  · Ejercicios:           Z tarjetas
  · Total Sektion 1:      X + Y + Z

Sektion 2
  · Traducción Directa:  …
  …

Sektion 3
  · Traducción Directa:  …
  …

Total libro: N tarjetas
```

Si el conteo de Traducción Directa **no cuadra** con el inventario del Paso 2 para alguna Sektion, **detente y revísalo antes de cerrar**: típicamente significa que saltaste oraciones del libro.

---

## Esquema JSON (uno por archivo, autosuficiente)

```json
{
  "bookId": "willkommen-vaughan",
  "bookTitle": "Willkommen — El alemán a su alcance (Vaughan)",
  "sektionId": "sektion-1",
  "sektionTitle": "Sektion 1: <título real del libro>",
  "order": 1,
  "cards": [
    { "id": "s1-t001", "front": "Hola, ¿cómo estás?", "back": "Hallo, wie geht's?" },
    { "id": "s1-g001", "front": "¿Qué es el caso acusativo?", "back": "Es el caso del objeto directo…" },
    { "id": "s1-u001", "front": "Plural de 'das Buch'", "back": "die Bücher" }
  ]
}
```

Reglas del esquema (no las rompas):

| Campo | Tipo | Reglas |
|---|---|---|
| `bookId` | string | `willkommen-vaughan` (no cambiar entre Sektionen). |
| `bookTitle` | string | Idéntico en los 3 archivos. |
| `sektionId` | string | `sektion-1`, `sektion-2`, `sektion-3`. |
| `sektionTitle` | string | El título real que aparece en el libro para esa Sektion. |
| `order` | number | 1, 2, 3 respectivamente. |
| `cards` | array | No vacío. Cada elemento con `id`, `front`, `back`. |
| `cards[].id` | string | Único en la Sektion. Estable entre re-generaciones (no renombrar). |
| `cards[].front` / `back` | string | Pueden usar `\n` para saltos de línea. **Sin Markdown ni HTML.** |

---

## Restricciones globales (no negociables)

1. **Solo contenido del libro.** No completes con conocimiento general de alemán. Si el libro no dice algo explícitamente, no aparece como tarjeta.
2. **No mezcles Sektionen.** Cada tarjeta vive en el JSON de la Sektion donde realmente aparece esa información en el libro.
3. **IDs estables.** Si re-generas, reutiliza los `id` previos para no romper el progreso guardado en `localStorage`.
4. **JSON válido.** El loader (`src/utils/loadCards.js`) descarta sektionen con campos faltantes o `cards[]` malformado y lo avisa en consola.
5. **Inventario primero, tarjetas después.** No saltes el Paso 2. Es la única defensa contra omitir oraciones.
