# Tarjetas de inglés: procedimiento y avance

El estado libro por libro está en [ENGLISH_BOOKS_PROGRESS.md](ENGLISH_BOOKS_PROGRESS.md).

## Fuente y estructura

- Archivos recibidos: `drive-download-20261110T145320Z-1-001.zip` (libros 1–20) y `drive-download-20261111T160431Z-1-001.zip` (libros 21–40 más duplicado del 20).
- Extracción local: `sources/english/`. Estos PDF y el ZIP no se versionan ni se incluyen en Vite.
- Libro 1: *Vaughan Intensive English*, 88 páginas PDF, una lección con tres niveles: básico (páginas PDF 4–31), intermedio (32–59) y avanzado (60–87). La página 88 es la contraportada.
- Cada nivel se publica como un JSON en `src/data/vaughan-intensive-english-01/`. El campo interno `sektionId` sigue siendo necesario para el cargador y para las claves de `localStorage`; en la interfaz se muestra como “Nivel”.
- Identificadores ya asignados: `bookId = vaughan-intensive-english-01`; `sektionId = nivel-basico`, `nivel-intermedio`, `nivel-avanzado`. Los ID de las tarjetas son `s1-001`, `s2-001`, `s3-001`, etc. **No renombrarlos después de publicar**, pues se perdería su progreso.

## Estado del piloto

| Nivel | PDF | JSON | Tarjetas | Estado |
| --- | --- | --- | ---: | --- |
| Básico | 4–31 | `nivel-1.json` | 113 | Redactado y compilado |
| Intermedio | 32–59 | `nivel-2.json` | 119 | Redactado y compilado |
| Avanzado | 60–87 | `nivel-3.json` | 121 | Redactado y compilado |

Las tarjetas reúnen frases de los ejercicios, vocabulario y diálogos. La cara frontal pregunta en español y la posterior da la respuesta en inglés. `sourcePage` apunta al **número de página del PDF**, no al número impreso en la hoja, y se muestra en la aplicación para consultar el libro. Páginas introductorias, pasatiempos gráficos, instrucciones que requieren el audio y páginas de respuestas no generan tarjetas repetidas.

## Repetir el proceso con otro libro

1. Extraer el PDF correspondiente en `sources/english/`.
2. Verificar si tiene texto con `fitz.open(...)[0].get_text()`. Estos PDF son escaneos sin capa de texto.
3. Renderizar: `python3 tools/render-scanned-pdf.py 'sources/english/Libro 02.pdf'`. Requiere PyMuPDF (`fitz`). Los PNG en `__pngs` se ignoran en Git.
4. Ejecutar OCR con Apple Vision: `python3 tools/ocr-scanned-pdf.py 'sources/english/Libro 02__pngs'`. El wrapper compila `tools/ocr-scanned-pages.swift` y reparte las páginas entre cuatro procesos. Requiere macOS con Swift y Vision. La salida OCR se ignora en Git.
5. Inspeccionar visualmente el PDF. El OCR intercala columnas y confunde `I` con `1`, contracciones, nombres y signos; no copiar frases sin verificar. Registrar la página PDF exacta de cada ejemplo.
6. Crear un `bookId` nuevo para el siguiente libro y tres archivos por nivel con los campos `bookId`, `bookTitle`, `language: "en"`, `sektionId`, `sektionTitle`, `order`, `cards`. Cada tarjeta lleva `id`, `front`, `back` y `sourcePage`.
7. Revisar que no haya pares repetidos, que los ID sean estables, que el español sea inequívoco y que el inglés coincida con el ejemplo o la construcción explicada por el libro. Ejecutar `npm run build` y probar selección de idioma, nivel, giro de tarjeta y marcación de progreso.

El libro 1 tiene un generador reproducible en `tools/build-english-book-01.py`; ese archivo conserva el texto revisado, la página y el orden de cada tarjeta. Al modificarlo, volver a ejecutar el script y revisar el JSON generado. Para libros posteriores se puede reutilizar el mismo formato de pares con página.
Desde el libro 2 se utiliza `tools/build-english-cards.py` con un TSV versionado en `tools/english-cards/book-NN.tsv`. Cada fila contiene nivel (`1`, `2` o `3`), página PDF, pregunta en español y respuesta en inglés, separados por tabulaciones. Se ejecuta `python3 tools/build-english-cards.py tools/english-cards/book-NN.tsv`.
Tras publicar un nivel, añadir nuevas tarjetas al final de su lista: el generador asigna ID según el orden y mover filas cambiaría las claves de progreso existentes.

## Integración en la aplicación

- `language: "en"` separa los libros ingleses en la biblioteca. Los JSON alemanes no se modifican y se consideran `de` si no tienen ese campo.
- La ruta visible para cada nivel es `/buch/:bookId/nivel/:sektionId`; usa el mismo `CardDeck` y las mismas valoraciones `understood` y `not_understood`.
- El repaso rápido usa claves independientes: alemán conserva `flashcards:review:v1`; inglés usa `flashcards:review:v1:en`.
- Pomodoro puede seleccionar las tarjetas del libro inglés y llama “Nivel” al selector. La exportación de progreso incluye ambas lenguas porque copia todas las claves `flashcards:`.

## Ajuste del libro 21

En el libro 21 los niveles intermedio y avanzado comienzan dos páginas PDF más tarde: los ejercicios seleccionados están en 34–39 y 44–49 para intermedio, y 62–67 y 72–77 para avanzado. Verificar los encabezados de cada PDF antes de aplicar rangos fijos de OCR.

## Ajuste del libro 24

El libro 24 tiene ejercicios básicos en las páginas PDF 4–9 y 14–19. El nivel intermedio empieza en la página PDF 31: hay ejercicios en 31–36 y 41–46; la 47 es un repaso ilustrado. El nivel avanzado empieza en la página PDF 59: los ejercicios están en 59–64 y 69–74; la 75 también es un repaso ilustrado. El OCR de las 48 páginas de ejercicios está en `sources/english/Libro 24.ocr.txt`, ignorado por Git. Se seleccionaron 4–19, 31–46 y 59–74 en una sola ejecución para evitar sobrescribir OCR previo.

## Correcciones de coherencia del libro 26

El OCR de los ejercicios está en `sources/english/Libro 26.ocr.txt` (páginas 4–19, 32–47 y 60–75). En la página PDF 17 la frase española dice «café» y la respuesta inglesa dice `tea`; la tarjeta usa «té» en el frente. En la página PDF 61 la frase española dice que alguien *se habría presentado* mientras que la respuesta inglesa dice `wouldn't have turned up`; la tarjeta añade «no» al frente. En la página PDF 71 la frase española menciona «varicela» y la respuesta inglesa `measles`; la tarjeta usa «sarampión». Estos ajustes mantienen la correspondencia entre ambas caras sin cambiar el inglés impreso.
