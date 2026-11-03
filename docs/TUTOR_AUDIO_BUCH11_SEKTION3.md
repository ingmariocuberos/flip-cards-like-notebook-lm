# Voz de la tutora — Buch 11, Sektion 3

La bitácora de ejecución y pendientes está en
[TUTOR_AUDIO_BUCH11_SEKTION3_PROGRESS.md](TUTOR_AUDIO_BUCH11_SEKTION3_PROGRESS.md).

## Objetivo y alcance acordado

Ampliar el piloto de `/resources/buch/willkommen-vaughan-11/sektion-3/tutor-pilot`
a **todas las intervenciones auténticas de la tutora del CD 43 que se puedan
emparejar de forma fiable con una tarjeta**. No inventar un corte para alcanzar
las 135 tarjetas: hay 113 tarjetas de traducción (`s3-t001`…`s3-t113`) y 22 de
gramática/contexto (`s3-g001`…`s3-g022`), y no todas están formuladas como
pregunta en el CD. Los clips deben excluir la respuesta del alumno. La app
funciona solo en el frontend; se preparan los clips una vez y luego se sirven
como archivos estáticos. El usuario autorizó publicar los clips en su sitio
actual, aun sabiendo que Netlify es accesible por URL hasta que se añada login.

**Ampliación solicitada por el usuario:** si antes de la frase la tutora da una
explicación de pronunciación, aclaración o incluso una broma que ayude a
recordarla, puede formar parte del **mismo audio de esa tarjeta**. Criterio
editorial: incluir contexto cercano y pertinente, sin convertir cada tarjeta
en una lección larga; cortar las intervenciones del alumno aunque interrumpan
la explicación. Si es necesario, unir varios tramos separados de voz de la
tutora con una pausa breve. El audio debe culminar en la frase que el usuario
ha de decir, de modo que después aparezca la tarjeta.

## Fuentes exactas y estructura

- PDF: `/Users/air1320158gb128gb/Downloads/Willkommen/11 Willkommen El aleman a su alcance Vaughan.pdf`.
- Audio: `/Users/air1320158gb128gb/Downloads/Willkommen/Willkommen El aleman a su alcance Vaughan cd 43/cd 43 mp3/`.
- Tarjetas: `src/data/willkommen-vaughan-11/sektion-3.json`. No cambiar sus IDs.
- Metadatos del piloto: `src/tutorAudioPilot.json`; cada entrada indica
  `cardId`, `track`, `start`, `end` (segundos en el MP3 original) y `audioSrc`.
  Para contexto no contiguo, admitir `segments: [{start, end}, ...]` y unirlos
  en orden. Los cortes originales sin `segments` siguen siendo válidos.
- Clips publicados: `public/audio/tutor-pilot-buch-11-sektion-3-<cardId>.m4a`.
- Reproductor: `src/components/TutorAudioPilot.jsx`, con valoración guardada
  en `localStorage` bajo `flashcards:tutor-audio-pilot:v1:...`.

El número del archivo MP3 no siempre coincide con el rótulo «Pista N» impreso
en el PDF. Confirmar por contenido hablado, no solo por número. Mapa observado:

| Archivo MP3 | Contenido | Tarjetas candidatas |
| --- | --- | --- |
| `01 Track01.mp3` | Lektion 1, *nehmen* y transporte | `s3-t001`–`s3-t015` |
| `02 Track02.mp3` | Señal *Rauchen verboten* | `s3-t102` |
| `03 Track03.mp3` | Lektion 2, restaurante | `s3-t016`–`s3-t038` |
| `04 Track04.mp3` | Lektion 3, ducha/baño/vacaciones | `s3-t039`–`s3-t053` |
| `05 Track05.mp3` | Fracciones (*Bruchzahlen*) | `s3-t103`–`s3-t111` |
| `06 Track06.mp3` | Ejercicio de estrés de vocabulario | por revisar |
| `07 Track07.mp3` | Lektion 4, *gehen* | `s3-t054`–`s3-t067` |
| `08 Track08.mp3` | Lektion 5, *fahren* | `s3-t068`–`s3-t082` |
| `09 Track09.mp3` | Lektion 6, *gehen auf* | `s3-t083`–`s3-t100` |
| `10 Track10.mp3` | por revisar | por revisar |
| `11 Track11.mp3` | Eco / repaso breve | por revisar |
| `12 Track12.mp3` | Repaso de la Sektion 3 | por revisar |
| `13 Track13.mp3` | Frase clave *Pass auf dich auf* | `s3-t101` |

## Herramientas y proceso

1. Crear un entorno Python local con `faster-whisper`, `rapidfuzz`, `av` y
   `numpy`. El modelo usado hasta ahora es `Systran/faster-whisper-tiny`,
   ejecutado en CPU (`int8`). La primera descarga del modelo puede tardar;
   el modelo no va al repositorio. Nunca se envían los MP3 a un servicio de
   transcripción: esta fase es local.
2. Generar borradores con tiempos de segmento mediante
   `tools/transcribe-tutor-tracks.py MODEL_DIR CD_DIR OUTPUT_DIR 01 03 04 ...`.
   Son **borradores**, no verdad de referencia: el modelo pequeño transcribe
   mal parte del alemán, omite palabras y puede alucinar en pausas. Mantener
   los JSON de transcripción fuera de `src/` para no incluirlos en Vite.
   La primera pasada con marcas de cada palabra (`beam_size=2`) tardó unos
   10 minutos por pista larga en este equipo. Por eso el script ahora hace
   una pasada rápida (`beam_size=1`, solo tiempos de segmento); los tiempos
   exactos de un candidato se afinan después en un clip corto. Las pistas
   01 y 07 ya quedaron transcritas con marcas por palabra en los JSON
   temporales antes de cambiar al modo rápido.
3. Ejecutar `tools/match-tutor-prompts.py TRANSCRIPT_DIR OUTPUT_JSON` para
   obtener candidatos de coincidencia entre frase española y tarjeta. El
   score solo prioriza revisión; no aceptar candidatos automáticamente.
4. Para cada candidato, comprobar en orden: (a) que la tutora realmente dice
   esa frase o un equivalente inequívoco, (b) que el corte comienza después
   de la intervención anterior, (c) que termina antes de la respuesta del
   alumno, (d) que el `cardId` y el alemán de la tarjeta corresponden.
   Preferir omitir una tarjeta dudosa. Si la frase se repite, elegir la
   intervención en que la tutora se dirige al alumno como ejercicio. Revisar
   unos segundos antes por si hay una explicación o broma pertinente que deba
   conservarse; si habla el alumno entre medias, usar varios `segments`.
5. Registrar el tiempo en `src/tutorAudioPilot.json`, conservar el orden de
   las tarjetas y generar M4A mono AAC con
   `tools/build-tutor-audio-pilot.py CD_DIR`. El script agrupa por pista y
   comprueba rangos e IDs duplicados. Verificar los clips resultantes por
   escucha o, como mínimo, una segunda transcripción local de los M4A.
6. Ejecutar `npm run build`, `git diff --check` y probar en navegador escritorio
   y móvil: audio → tarjeta → giro → valoración → siguiente; también recarga,
   fin de sesión y repaso de «No entendí». Antes de publicar, revisar que el
   commit incluya solo los clips y archivos del piloto.

## Cortes ya validados en el piloto inicial

La voz española del primer archivo se transcribió de nuevo después de la
extracción; los clips no contienen la respuesta alemana del alumno:

| Tarjeta | MP3 | Inicio–fin |
| --- | --- | --- |
| `s3-t001` Hoy cojo el tren | 01 | 85.62–86.70 s |
| `s3-t002` ¿Coges hoy el tren? | 01 | 93.73–97.26 s |
| `s3-t004` Yo nunca cojo el autobús | 01 | 162.26–164.12 s |

### Hallazgo durante la ampliación

La transcripción completa de `05 Track05.mp3` muestra que el bloque de
fracciones es principalmente explicación, lectura bilingüe y dictado de
números. Aunque el comparador encuentra «un medio» y «dos tercios», **eso no
demuestra que sean preguntas de traducción dirigidas al alumno**. No incluir
automáticamente `s3-t103`–`s3-t111` por simple similitud textual. Del mismo
modo, `02 Track02.mp3` repite varias veces «prohibido fumar» en una explicación
de señales; seleccionar únicamente una pregunta auténtica si se puede aislar.

En `07 Track07.mp3` (Lektion 4) hay divergencias entre las tarjetas y el
material original que impiden emparejar a ciegas:

- `s3-t058` en la app dice «Él nunca va a la iglesia», pero el PDF (página 43,
  ASPEKT 2) dice «(Él) Nunca va a la ópera» / `Er geht nie in die Oper`; el
  borrador de audio también reconoce «ópera». **No usar ese clip para t058**.
- `s3-t062` en la app está en primera persona plural («Vamos a menudo a la
  piscina»), mientras el PDF (página 43, ASPEKT 3) dice «Ellos van a la piscina
  a menudo» / `Sie gehen oft ins Schwimmbad`. No emparejar sin corrección.
- El PDF para `s3-t054` dice «viernes», pero el borrador del audio cerca de
  63–70 s parece decir «sábados» / `samstags`. Confirmar con un clip corto
  antes de incluirlo; podría ser una variación hablada o error de ASR.
- Ejemplo para el nuevo criterio de contexto: en la pista 07 la tutora explica
  cerca de 416.7–420.3 s que `in Rente` significa «jubilarse», y formula
  «Mi padre se jubilará pronto» cerca de 428.8–430.6 s. Un clip para
  `s3-t065` podría unir esos dos tramos y excluir las intervenciones entre
  medias. Verificar antes de publicar.

La regla es conservar los IDs de tarjetas y no cambiar su contenido
silenciosamente durante este trabajo. Omitir coincidencias falsas y documentar
errores de contenido para una corrección separada.

El modo rápido de ASR ya generó borradores de 03 y 08. La pista 03 da algunas
coincidencias fuertes (por ejemplo `s3-t017` «Tomaré el filete de ternera» y
`s3-t023` «Tomaremos la Pizza Margarita»), pero otras son falsos positivos
porque «tomar» se repite en muchas frases. La pista 08 repite «No voy nunca a
la Selva Negra» y «Mis padres siempre van a Suiza»; también contiene largos
tramos de respuesta alemana que el modelo pequeño alucina como castellano.
No usar una similitud alta sin revisar la frase y la ventana temporal.

Los extras 06 y 13 se revisaron: 06 es un ejercicio de género de sustantivos,
no una secuencia de preguntas correspondientes a las tarjetas de traducción;
13 presenta *Pass auf dich auf* en alemán y explica su significado en español,
no pregunta al alumno cómo decir «Cuídate» en alemán. Para `s3-t101` es mejor
revisar la pista 12, donde sí parece preguntar «¿Cómo decimos cuídate?».

## Estado de trabajo (actualizar continuamente)

- [x] Piloto de tres preguntas publicado y probado (`ea0c4e5`).
- [x] Rutas directas de Netlify corregidas (`d751400`).
- [x] Inventario de 135 tarjetas y mapa preliminar de las 13 pistas.
- [x] Scripts de transcripción, ranking de candidatos y extracción por pista.
- [x] Borradores de las pistas 02 y 05 en la carpeta temporal.
- [x] Borradores locales de las 13 pistas; copia persistente en `sources/transcripts/cd43/`.
- [x] Primer lote de 35 clips candidatos generado y auditado por segunda transcripción.
- [ ] Escucha/revisión final de voz y límites, prueba de UI y publicación del lote.
- [ ] Revisar y registrar todas las coincidencias auténticas fiables.
- [ ] Generar todos los clips y comprobar que no incluyen voz del alumno.
- [ ] Actualizar la interfaz, validar móvil/escritorio y publicar.

La carpeta temporal usada durante esta ejecución es
`/private/tmp/vaughan-cd43-transcripts/`; puede borrarse o desaparecer. Si
ocurre, regenerar desde los MP3 con el paso 2. El modelo local actual está en
`/Users/air1320158gb128gb/.cache/huggingface/hub/models--Systran--faster-whisper-tiny/snapshots/d90ca5fe260221311c53c58e660288d3deb8d356`.
La transcripción de extras se pausó tras 02 y 05 para dar prioridad a las
seis lecciones; reanudar desde 06, 10, 11, 12 y 13 cuando terminen las largas.
