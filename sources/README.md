# Sources

Esta carpeta contiene los libros y materiales fuente (PDFs, texto plano, transcripciones) a partir de los cuales se generan las tarjetas didácticas. **No se incluye en el bundle de la app** — vive aquí solo para que Claude (vía CLI) pueda leer el contenido y generar los JSON correspondientes.

## Cómo añadir un libro

1. Crear una subcarpeta con un slug del libro: `sources/berliner-platz-a1/`
2. Poner dentro los PDFs o `.txt` del libro.
3. Pedir a Claude algo como:
   > "Genera tarjetas de Vocabulario de la Sektion 1 del libro `berliner-platz-a1`"

## Convenciones para los JSON generados

Claude debe crear archivos en `src/data/{bookId}/sektion-N.json` con esta forma:

```json
{
  "bookId": "berliner-platz-a1",
  "bookTitle": "Berliner Platz NEU A1",
  "sektionId": "sektion-1",
  "sektionTitle": "Sektion 1: Hallo!",
  "order": 1,
  "cards": [
    { "id": "s1-001", "front": "...", "back": "..." }
  ]
}
```

Reglas:

- **`bookId` / `sektionId`** son slugs estables (kebab-case). No los cambies después de generar tarjetas, porque se usan como clave en `localStorage` y romperías el progreso guardado del usuario.
- **`id` de cada tarjeta** también debe ser estable y único dentro de la Sektion. Usa `s{N}-{NNN}` (p. ej. `s1-014`).
- **`order`** es numérico y opcional; controla el orden en el menú de Sektionen del libro.
- **`front` / `back`** pueden ser strings con `\n` para saltos de línea. La app respeta `white-space: pre-wrap`.
- Cada Sektion va en **su propio archivo**. Apunta a 100-200 tarjetas por sektion.
- No incluyas comentarios JSON ni claves extra — el loader valida los campos requeridos.

## Validación

Al levantar la app (`npm run dev`), abrir la consola del navegador: el loader en `src/utils/loadCards.js` imprime warnings si un JSON no cumple el esquema.

## Cómo leer PDFs grandes (workflow para Claude)

El tool `Read` tiene dos límites con PDFs:

1. **PDFs > 100 MB**: no los procesa en absoluto. Hay que partirlos.
2. **PDFs escaneados sin capa de texto**: el tool intenta usar `pdftoppm` (poppler), que no está instalado en este sistema. Hay que pre-renderizar las páginas como PNG.

Para resolver ambos casos hay dos scripts en `tools/` que usan Python + PyMuPDF (wheel binario, sin dependencias de sistema):

### `tools/split-pdf.py` — partir un PDF en trozos

```bash
python3 tools/split-pdf.py "sources/<libro>.pdf" --pages-per-chunk 25
```

Genera `<libro>__chunks/<libro>__pages-NNN-MMM.pdf` (cada uno < 100 MB).
Usar cuando: el PDF excede 100 MB **y tiene capa de texto** (Read funcionará en los chunks).

### `tools/pdf-to-pngs.py` — renderizar páginas a PNG

```bash
python3 tools/pdf-to-pngs.py "sources/<libro>.pdf" --pages 1-10 --dpi 150
```

Genera `<libro>__pngs/<libro>__pNNN.png`. Estos PNGs sí los lee el tool `Read` directamente.
Usar cuando: el PDF es **escaneado** (sin texto), independientemente del tamaño. Es el caso de `04 Willkommen El aleman a su alcance Vaughan.pdf`.

### Cómo decidir cuál usar

```bash
# 1) ¿Tiene capa de texto?
python3 -c "from pypdf import PdfReader; r=PdfReader('sources/X.pdf'); print('chars page 1:', len(r.pages[0].extract_text() or ''))"
```

- Si imprime un número > 0 → tiene texto → usa `split-pdf.py`.
- Si imprime `0` → es escaneado → usa `pdf-to-pngs.py`.

### Dependencias

Ya instaladas en este sistema vía `pip3 install --user`:
- `pypdf` (para split y detección de capa de texto)
- `pymupdf` (para renderizar a PNG)

Si se cambia de máquina, reinstalar con `pip3 install --user pypdf pymupdf`.
