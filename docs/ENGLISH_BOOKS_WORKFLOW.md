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

## Libros desde el 32: escaneos de pliegos

El PDF del libro 32 tiene 50 páginas apaisadas, cada una con dos páginas impresas lado a lado. El OCR de la página completa intercala las columnas de ambas mitades y no es una base fiable para redactar tarjetas. Tras renderizar el PDF, dividir los pliegos con `python3 tools/split-english-spreads.py 'sources/english/Libro 32__pngs' 6 44` y ejecutar `python3 tools/ocr-scanned-pdf.py 'sources/english/Libro 32__halves'`. Las imágenes `__halves` y el OCR resultante se ignoran en Git. La mitad izquierda del pliego PDF `p` se etiqueta `2p-1` y la derecha `2p` en el OCR; **`sourcePage` de las tarjetas debe seguir siendo la página PDF `p`**, que es la que puede abrir la aplicación.

En el libro 32, los ejercicios con Focus Points están en las mitades OCR 11–26 (PDF 6–13, básico), 39–54 (PDF 20–27, intermedio) y 65–80 (PDF 33–40, avanzado). Las páginas entre estas bandas contienen vocabulario, pasatiempos, diálogos y resúmenes. No asumir la misma distribución en los libros 33–40 sin comprobar sus encabezados.

El libro 33 tiene 51 pliegos PDF (102 páginas impresas). Se renderizó completo, se separó con `python3 tools/split-english-spreads.py 'sources/english/Libro 33__pngs' 1 51` y su OCR local está en `sources/english/Libro 33__halves.ocr.txt`. Los ejercicios con Focus Points están en las mitades 11–26 (PDF 6–13, básico), 39–54 (PDF 20–27, intermedio) y 67–82 (PDF 34–41, avanzado). El avanzado empieza un pliego más tarde que en el libro 32.

En el libro 33 se transcribieron 90 tarjetas por nivel. Se normalizaron los horarios `14:00pm` y `22:30pm` de la página PDF 12 a `2pm` y `10:30pm`. En la página PDF 39, la cara española de «Podemos hacer borrón y cuenta nueva...» se ajustó a «Te dejaré hacer borrón y cuenta nueva...» para corresponder a `I'll let you...`. En la página PDF 25 se completó `incorrectly` en «You've added these figures incorrectly» para que el inglés exprese «has sumado mal».

El libro 34 tiene 46 pliegos PDF (92 páginas impresas). Se renderizó completo, se separó con `python3 tools/split-english-spreads.py 'sources/english/Libro 34__pngs' 1 46` y el OCR local está en `sources/english/Libro 34__halves.ocr.txt`. Sus páginas con Focus Points son las mitades 11–14, 19–24 (básico; PDF 6–7 y 10–12), 37–42, 47–52 (intermedio; PDF 19–21 y 24–26), y 65–70, 75–80 (avanzado; PDF 33–35 y 38–40). Hay cinco Momentos con Focus Points en básico y seis en intermedio y avanzado. Las páginas intercaladas incluyen otros formatos; no inventar frases para igualar la cantidad de tarjetas entre niveles.

En el libro 34 se transcribieron 75 / 90 / 90 tarjetas. En la página PDF 11 se cambió el orden de los brazos en la pregunta española para corresponder a la respuesta inglesa. En la página PDF 40 se ajustó «te daremos la carta de despido» a «recibirás la carta de despido» para respetar la voz pasiva `you'll be given`.

El libro 35 tiene 47 pliegos PDF. Se renderizaron y separaron en 94 mitades; el OCR local está en `sources/english/Libro 35__halves.ocr.txt`. Los Focus Points están en las mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), y 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 / 90 / 91 tarjetas. En la página PDF 21 se hizo explícito «él» en el frente de `He shouldn't have started going out with her` para evitar ambigüedad.

El libro 36 tiene 47 pliegos PDF. Se renderizaron y separaron en 94 mitades; el OCR local está en `sources/english/Libro 36__halves.ocr.txt`. Los Focus Points están en las mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), y 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 / 90 / 87 tarjetas. La página PDF 40 del avanzado presenta 12 ejemplos, de ahí las tres tarjetas menos. En la página PDF 7 se ajustaron sujetos y días del frente para que coincidan con las respuestas inglesas; en la PDF 13 se añadió el aparato al frente de cada pregunta genérica «¿Por qué no funciona?» para que sea autónoma.

El libro 37 tiene 47 pliegos PDF. Se renderizaron y separaron en 94 mitades; el OCR local está en `sources/english/Libro 37__halves.ocr.txt`. Los Focus Points están en las mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), y 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 / 90 / 90 tarjetas. Se corrigieron errores evidentes del OCR en nombres, contracciones y palabras inglesas como `found` en la página PDF 26. En la página PDF 12, los pares de diálogo se agruparon en tarjetas completas para conservar el contexto de las respuestas.

El libro 38 tiene 87 páginas individuales, sin pliegos dobles. El OCR local está en `sources/english/Libro 38.ocr.txt`. Los Focus Points están en las páginas PDF 6–11 y 16–21 (básico), 34–39 y 44–49 (intermedio), y 62–67 y 72–77 (avanzado). Se transcribieron 90 / 90 / 90 tarjetas. Se corrigieron errores evidentes de OCR en `Does`, contracciones y algunas palabras partidas; en las tarjetas de diálogos se conservó el contexto en una sola pregunta.

El libro 39 tiene 46 pliegos PDF. Se renderizaron y separaron en 92 mitades; el OCR local está en `sources/english/Libro 39__halves.ocr.txt`. Los Focus Points están en las mitades 9–14 y 19–24 (PDF 5–7 y 10–12, básico), 37–42 y 47–52 (PDF 19–21 y 24–26, intermedio), y 65–70 y 75–80 (PDF 33–35 y 38–40, avanzado). Se transcribieron 90 / 90 / 90 tarjetas. Se completaron contracciones y palabras partidas por OCR. En la página PDF 40 la respuesta inglesa de `mistrial` quedó ausente del OCR y se reconstruyó a partir de la frase española y el Focus Point; conviene cotejarla visualmente en futuras auditorías.

El libro 40 tiene 47 pliegos PDF. Se renderizaron y separaron en 94 mitades; el OCR local está en `sources/english/Libro 40__halves.ocr.txt`. Los Focus Points están en las mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), y 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 / 90 / 90 tarjetas. Se reconstruyeron contracciones y palabras partidas por OCR y se conservaron diálogos completos cuando una respuesta aislada sería ambigua. La frase `mistrial` del libro 39, página PDF 40, se verificó visualmente en la imagen de la mitad 79; la tarjeta coincide con la impresión.

El libro 41 procede de `drive-download-20261119T202355Z-1-001.zip` y tiene 46 pliegos PDF. Se separaron en 92 mitades y se ejecutó OCR en `sources/english/Libro 41__halves.ocr.txt`. Los Focus Points están en las mitades 9–14 y 19–24 (PDF 5–7 y 10–12, básico), 37–42 y 47–52 (PDF 19–21 y 24–26, intermedio), y 65–70 y 75–80 (PDF 33–35 y 38–40, avanzado). Se transcribieron 90 / 90 / 90 tarjetas. Se corrigieron discrepancias del original: semáforo rojo a verde (PDF 6), transbordo en Court Square (PDF 12), moneda de cinco libras (PDF 24); se ajustó `a great deal of changes` a `a lot of changes` (PDF 19). En PDF 40 se conservó la unidad inglesa de tres stones en ambas caras.

Auditoría del piloto con Terra (libro 41): se revirtió la modificación injustificada de 17 peniques a 4,65 libras en PDF 24. No se conoce el precio de la compra, por lo que no puede calcularse el cambio debido a partir del billete entregado. Se corrigió `parking metre` a `parking meter`. Para próximos libros: cotejar visualmente cada corrección de contenido, completar frases truncadas usando la imagen y no inferir datos ausentes. La compilación verifica estructura, pero no la exactitud lingüística.

El libro 42 tiene 47 pliegos PDF, separados en 94 mitades; OCR local en `sources/english/Libro 42__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. Se ajustaron discrepancias entre las columnas en PDF 6 y 11 para reflejar la frase inglesa; en PDF 34 se conserva la frase intencionalmente incorrecta del letrero, que es el objeto del ejemplo.

El libro 43 tiene 47 pliegos, separados en 94 mitades; OCR local en `sources/english/Libro 43__halves.ocr.txt`. Sus Focus Points están en mitades 11–16 y 21–24 (PDF 6–8 y 11–12, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 75 / 90 / 90 tarjetas; básico contiene cinco Momentos. En PDF 25 se ajustó el frente a «segunda» para coincidir con la respuesta inglesa.

El libro 44 tiene 47 pliegos PDF, divididos en 94 mitades; OCR local en `sources/english/Libro 44__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. En PDF 27 se añadieron indicaciones a dos frentes idénticos para distinguir las construcciones practicadas; en PDF 26 se formuló el inglés del plazo de dos semanas de forma natural.

El libro 45 tiene 47 pliegos PDF, divididos en 94 mitades; OCR local en `sources/english/Libro 45__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. Se ajustaron algunos frentes cuando diferían de la respuesta inglesa en PDF 25 y 26.

El libro 46 tiene 48 pliegos PDF, divididos en 96 mitades; OCR local en `sources/english/Libro 46__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. En PDF 22 se ajustó «tu vaso» a «mi vaso» para corresponder a la respuesta inglesa y se distinguieron dos frentes repetidos.

El libro 47 tiene 47 pliegos PDF y OCR local en `sources/english/Libro 47__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. En PDF 34 se ajustó el frente de la puerta entreabierta para reflejar el sujeto inglés.

El libro 48 tiene 48 pliegos PDF y OCR local en `sources/english/Libro 48__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. Se distinguieron frentes duplicados en PDF 8, 12 y 36; se alinearon algunos frentes con la respuesta inglesa (PDF 8, 25, 35 y 39) y se corrigieron erratas inglesas evidentes en PDF 27 y 39.

El libro 49 tiene 47 pliegos PDF y OCR local en `sources/english/Libro 49__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. Se distinguieron variantes del móvil en PDF 8 y se ajustaron algunos frentes a sus respuestas inglesas en PDF 35, 36 y 39.

El libro 50 tiene 47 pliegos PDF y OCR local en `sources/english/Libro 50__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. Se alinearon frentes con la respuesta inglesa en PDF 7, 21, 34 y 36; se corrigió la concordancia inglesa de flowers/need en PDF 41.

El libro 51 tiene 47 pliegos PDF y OCR local en `sources/english/Libro 51__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. Se distinguieron variantes de traducción en PDF 26, se alinearon algunos frentes con el inglés en PDF 6 y 36 y se corrigieron erratas inglesas evidentes.

El libro 52 tiene 47 pliegos PDF y OCR local selectivo en `sources/english/Libro 52__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 89 / 90 / 90 tarjetas; en el básico se agruparon intercambios de pregunta y respuesta. En PDF 40 se corrigió la concordancia de la profesora y se identificaron variantes en PDF 8.

El libro 53 tiene 47 pliegos PDF y OCR selectivo en `sources/english/Libro 53__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. Se distinguieron variantes en PDF 25 y 26, se alinearon frentes con el inglés en PDF 13, 22 y 40, y se corrigieron erratas inglesas evidentes.

El libro 54 tiene 47 pliegos PDF y OCR selectivo en `sources/english/Libro 54__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. Se alinearon algunos frentes y se corrigieron erratas inglesas en PDF 13, 20, 22, 27, 35 y 41.

El libro 55 tiene 48 pliegos PDF y OCR selectivo consolidado en `sources/english/Libro 55__halves.ocr.txt`. A diferencia de los anteriores, los Focus Points están desplazados dos mitades: 13–18 y 23–28 (PDF 7–9 y 12–14, básico), 41–46 y 51–56 (PDF 21–23 y 26–28, intermedio), 69–74 y 79–84 (PDF 35–37 y 40–42, avanzado). Se transcribieron 90 tarjetas por nivel y se corrigieron erratas evidentes y discrepancias entre columnas.

El libro 56 tiene 46 pliegos PDF y OCR selectivo en `sources/english/Libro 56__halves.ocr.txt`. Focus Points: mitades 9–14 y 19–24 (PDF 5–7 y 10–12, básico), 37–42 y 47–52 (PDF 19–21 y 24–26, intermedio), 65–70 y 75–80 (PDF 33–35 y 38–40, avanzado). Se transcribieron 90 tarjetas por nivel; se alinearon frentes con las respuestas inglesas y se corrigieron erratas evidentes.

El libro 57 tiene 48 pliegos PDF y OCR selectivo en `sources/english/Libro 57__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel. Se diferenciaron variantes de un mismo frente y se corrigieron erratas y discrepancias evidentes.


El libro 58 tiene 47 pliegos PDF y OCR selectivo en `sources/english/Libro 58__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel; se corrigieron erratas evidentes y se alinearon traducciones discrepantes.


El libro 59 tiene 46 pliegos PDF y OCR selectivo en `sources/english/Libro 59__halves.ocr.txt`. Focus Points: mitades 9–14 y 19–24 (PDF 5–7 y 10–12, básico), 37–42 y 47–52 (PDF 19–21 y 24–26, intermedio), 65–70 y 75–80 (PDF 33–35 y 38–40, avanzado). Se transcribieron 90 tarjetas por nivel; se alinearon traducciones y corrigieron erratas, incluyendo «half-hour drive».


El libro 60 tiene 44 pliegos PDF y OCR selectivo en `sources/english/Libro 60__halves.ocr.txt`. Tiene cuatro bloques Focus Points por nivel: mitades 9–10, 15–20 (PDF 5 y 8–10, básico), 37–38, 43–48 (PDF 19 y 22–24, intermedio), 65–66, 71–76 (PDF 33 y 36–38, avanzado). Se transcribieron 60 tarjetas por nivel y se corrigieron erratas y discrepancias evidentes.


El libro 61 tiene 46 pliegos PDF y OCR selectivo en `sources/english/Libro 61__halves.ocr.txt`. Focus Points: mitades 9–14 y 19–24 (PDF 5–7 y 10–12, básico), 37–42 y 47–52 (PDF 19–21 y 24–26, intermedio), 65–70 y 75–80 (PDF 33–35 y 38–40, avanzado). Se transcribieron 90 tarjetas por nivel; se corrigieron erratas y se distinguieron variantes.


El libro 62 tiene 46 pliegos PDF y OCR selectivo en `sources/english/Libro 62__halves.ocr.txt`. Focus Points: mitades 9–14 y 19–24 (PDF 5–7 y 10–12, básico), 37–42 y 47–52 (PDF 19–21 y 24–26, intermedio), 65–70 y 75–80 (PDF 33–35 y 38–40, avanzado). Se transcribieron 90 tarjetas por nivel; se corrigieron erratas y discrepancias y se distinguieron variantes.


El libro 63 tiene 47 pliegos PDF y OCR selectivo en `sources/english/Libro 63__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel y se corrigieron erratas y discrepancias.


El libro 64 tiene 47 pliegos PDF y OCR selectivo en `sources/english/Libro 64__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel y se corrigieron erratas y discrepancias entre columnas.


El libro 65 tiene 47 pliegos PDF y OCR selectivo en `sources/english/Libro 65__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel; el bloque PDF 25 tiene encabezados OCR alterados y el de PDF 40 presenta los puntos en orden inverso. Se corrigieron erratas y discrepancias.


El libro 66 tiene 46 pliegos PDF y OCR selectivo en `sources/english/Libro 66__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–24 (PDF 6–8 y 11–12, básico), 37–42 y 47–52 (PDF 19–21 y 24–26, intermedio), 65–70 y 75–80 (PDF 33–35 y 38–40, avanzado). El básico tiene cinco bloques; se transcribieron 75 / 90 / 90 tarjetas y se corrigieron erratas y discrepancias.


El libro 67 tiene 47 pliegos PDF y OCR selectivo en `sources/english/Libro 67__halves.ocr.txt`. Focus Points: mitades 11–16 y 21–26 (PDF 6–8 y 11–13, básico), 39–44 y 49–54 (PDF 20–22 y 25–27, intermedio), 67–72 y 77–82 (PDF 34–36 y 39–41, avanzado). Se transcribieron 90 tarjetas por nivel y se corrigieron erratas y discrepancias.
