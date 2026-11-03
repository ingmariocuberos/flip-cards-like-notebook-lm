# Bitácora de avance — tutora, Buch 11 / Sektion 3

Esta es la **bitácora de estado**, separada de la [guía de proceso](TUTOR_AUDIO_BUCH11_SEKTION3.md).
Actualizarla al terminar cada tanda para no repetir transcripción, comparación
ni cortes en otra sesión. Estado al 2026-11-03. La versión publicada en Netlify
todavía es el piloto de 3 preguntas (`d751400` es el último commit remoto);
**los 35 clips nuevos están solo en el árbol de trabajo** y aún no se han
publicado.

## Ubicaciones que permiten retomar

- MP3 originales: `/Users/air1320158gb128gb/Downloads/Willkommen/Willkommen El aleman a su alcance Vaughan cd 43/cd 43 mp3/`.
- PDF: `/Users/air1320158gb128gb/Downloads/Willkommen/11 Willkommen El aleman a su alcance Vaughan.pdf`.
- Borradores ASR de **las 13 pistas**: `sources/transcripts/cd43/01.json` …
  `13.json`. Son salida automática no corregida y no se incluyen en Vite.
- Copia temporal de esos mismos borradores: `/private/tmp/vaughan-cd43-transcripts/`.
- Ranking temporal de candidatos: `/private/tmp/vaughan-cd43-candidates.json`.
- Segunda transcripción de los primeros 38 clips candidatos:
  `/private/tmp/vaughan-cd43-audit.json` (contiene tres clips luego descartados).
- Selección vigente y rangos exactos: `src/tutorAudioPilot.json`. **Este es el
  inventario canónico**; no reconstruirlo desde el ranking temporal.
- M4A generados: `public/audio/tutor-pilot-buch-11-sektion-3-*.m4a`.

## Pista por pista

«Página PDF» se refiere al número que muestra el visor (un PDF por cada
pliego de dos páginas del libro). El número impreso de pista es uno mayor que
el número del archivo MP3 para 01–12; `13 Track13.mp3` contiene la pista 1
impresa. Esto se verificó por el contenido hablado y los rótulos del PDF.

| MP3 | Pista impresa / página PDF (páginas del libro) | Contenido | Estado de transcripción y selección | Clips vigentes |
| --- | --- | --- | --- | ---: |
| 01 | Pista 2, PDF 35–36 (72–75) | Lektion 1, *nehmen* + transporte | Transcrita y revisada; 5 cortes seleccionados; varias frases habladas difieren o no se aíslan | 5 |
| 02 | Pista 3, PDF 37 izq. (76) | Señal *Rauchen verboten* | Transcrita; explicación/repetición, sin pregunta español→alemán inequívoca para `s3-t102` | 0 |
| 03 | Pista 4, PDF 37–38 (76–79) | Lektion 2, restaurante | Transcrita y revisada; 8 cortes seleccionados, algunos con introducción de la tutora | 8 |
| 04 | Pista 5, PDF 39–40 (80–83) | Lektion 3, ducha/baño/vacaciones | Transcrita y revisada; 6 cortes seleccionados; 051 y 052 descartados tras segunda transcripción | 6 |
| 05 | Pista 6, PDF 41 (84–85) | *Bruchzahlen* / dictado | Transcrita; coincidencias de palabras son explicación o dictado, no preguntas fiables para las tarjetas | 0 |
| 06 | Pista 7, PDF 42 izq. (86) | *Stress*, género de sustantivos | Transcrita y revisada; no corresponde al ejercicio español→alemán de esta modalidad | 0 |
| 07 | Pista 8, PDF 42–43 (86–89) | Lektion 4, *gehen* | Transcrita y revisada; 7 cortes, incluido un clip de dos tramos para `s3-t065` | 7 |
| 08 | Pista 9, PDF 44–45 (90–93) | Lektion 5, *fahren* | Transcrita y revisada; 5 cortes, incluido un clip de dos tramos para `s3-t074` | 5 |
| 09 | Pista 10, PDF 46–47 (94–97) | Lektion 6, *gehen auf* | Transcrita y revisada; 3 cortes fiables; numerosos prompts hablados difieren de las tarjetas | 3 |
| 10 | Pista 11, PDF 48–49 (98–100) | *Ponte en forma*, composición guiada | Transcrita; primera revisión no halló una pregunta íntegra y fiable para el mazo actual; revisar solo si se amplía a otra modalidad | 0 |
| 11 | Pista 12, PDF 49 dcha. (100–101) | *Eco* | Transcrita; frases de eco no coinciden con las tarjetas de respuesta de la modalidad | 0 |
| 12 | Pista 13, PDF 50 (100–101) | Repaso | Transcrita y revisada; 1 corte («seis séptimos»). `s3-t101` descartada tras la segunda transcripción | 1 |
| 13 | Pista 1, PDF 35 izq. (72) | Frase clave *Pass auf dich auf* | Transcrita; explica alemán→español, no pregunta «Cuídate» para producir el alemán | 0 |

Total vigente: **35 clips** que ocupan aproximadamente 1,3 MB. Los 35 IDs y
sus tiempos están en `src/tutorAudioPilot.json`; el desglose actual es 01:5,
03:8, 04:6, 07:7, 08:5, 09:3, 12:1. No añadir automáticamente los otros 100
IDs del mazo: se acordó usar solo intervenciones auténticas verificables.

## Trabajo ya realizado y decisiones

1. El piloto de tres clips está publicado y funciona. No volver a crearlo.
2. Se instalaron dependencias de ASR en
   `/private/tmp/vaughan-pilot-asr-venv/` y el modelo tiny en la caché de
   Hugging Face. Las transcripciones de las 13 pistas ya están copiadas en
   `sources/transcripts/cd43/`; **no volver a transcribir pistas enteras**.
3. `tools/match-tutor-prompts.py` priorizó ventanas por similitud textual.
   Se corrigió un error de su primera versión: `token_set_ratio` puntuaba
   «el tren» como 94/100 para frases largas; ahora usa `token_sort_ratio`.
   El ranking no es una lista de cortes aprobados.
4. Se adaptó `tools/build-tutor-audio-pilot.py` a múltiples MP3 y al campo
   opcional `segments` para unir solo voz de la tutora. `s3-t027`, `s3-t033`,
   `s3-t065` y `s3-t074` usan dos tramos (contexto + frase) separados por
   220 ms de silencio. Los demás usan `start`/`end`.
5. Se generaron 38 candidatos y se transcribieron los M4A resultantes con
   `tools/audit-tutor-clips.py`. Se **descartaron y borraron** los M4A de
   `s3-t051` (persona plural distinta), `s3-t052` (el corte no contenía la
   frase completa) y `s3-t101` (la pregunta no decía «Cuídate» de forma
   inequívoca). Son generables otra vez desde el CD, pero no están en la
   selección vigente.
6. La segunda auditoría detectó y se corrigieron límites en `s3-t040`,
   `s3-t065`, `s3-t069`, `s3-t078` y `s3-t080`. Los M4A se regeneraron.
   La segunda transcripción de los corregidos confirma la frase; para
   `s3-t065` el modelo oye mal «Mi padre» en el tramo corto, pero la
   transcripción del original a 428.78–430.46 s sí reconoce la frase completa.
7. No se han modificado IDs ni texto de las tarjetas. Hay divergencias reales
   en `s3-t058` (app: iglesia; PDF/audio: ópera), `s3-t062` (app: nosotros;
   PDF/audio: ellos) y posiblemente `s3-t054` (PDF: viernes; audio parece
   sábados). Están documentadas en la guía y se dejaron fuera del audio.
8. Se añadió al reproductor un botón de «Repasar no entendidas» al acabar;
   todavía falta comprobarlo en navegador con los 35 clips.

## Próximo paso exacto

1. Revisar que `src/tutorAudioPilot.json` sea JSON válido, que sus 35 `cardId`
   existan en `src/data/willkommen-vaughan-11/sektion-3.json` y que haya un
   M4A para cada `audioSrc`, sin M4A huérfanos nuevos.
2. Hacer una pasada de escucha/auditoría de los 35 clips. La transcripción
   automática confirma muchos textos pero **no prueba identidad de voz**.
   Especial atención a `s3-t027`, `s3-t033`, `s3-t065`, `s3-t074` (uniones),
   `s3-t024` (corte basado en tiempo aproximado) y `s3-t108`.
3. Ajustar el texto de UI para que diga «Práctica con la tutora» sin «Piloto» y
   explique que puede incluir aclaraciones o bromas previas. Conservar la
   URL existente para que los enlaces ya compartidos sigan funcionando.
4. Probar `npm run build`, `git diff --check` y la ruta en navegador a ancho
   móvil/escritorio, incluida recarga y «Repasar no entendidas».
5. Actualizar esta bitácora con el número final, hacer commit/push **solo** de
   archivos del ejercicio, documentación, transcripciones y clips nuevos;
   no incluir los demás archivos sin seguimiento del usuario. Verificar HTTP
   200 de la ruta y algunos clips en Netlify tras el despliegue.

Nota: el ASR tiny comete errores graves en respuestas en alemán e incluso
alucina durante silencios. La segunda transcripción es un filtro útil, no
sustituye la verificación de voz. La reproducción pública seguirá sin login
hasta que se implemente el control de acceso acordado.
