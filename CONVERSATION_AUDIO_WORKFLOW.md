# Guía para conversaciones y audio de los Bücher

Este documento es la referencia obligatoria para crear la sección
`Conversation` de los recursos audiovisuales. Debe leerse completo al inicio
de cada iteración, antes de trabajar en el siguiente Buch.

## Objetivo y orden de trabajo

- Crear una sección `Conversation` para cada Buch, del 4 al 50.
- Buch 4 ya está terminado. Continuar progresivamente desde Buch 5 hasta Buch
  50, estrictamente uno por uno.
- No empezar el siguiente libro hasta que el libro actual tenga conversación,
  audio, validaciones, commit y push terminados.
- Cada conversación debe durar como mínimo aproximadamente dos minutos en el
  audio final.
- El audio debe generarse localmente con XTTS-v2, sin consumir un servicio de
  pago.
- Al terminar cada Buch se debe hacer siempre commit y push a `origin/main`.

## Fuente lingüística y límite de alcance

La única fuente de contenido para un libro son sus tres archivos:

```text
src/data/willkommen-vaughan-N/sektion-1.json
src/data/willkommen-vaughan-N/sektion-2.json
src/data/willkommen-vaughan-N/sektion-3.json
```

Antes de escribir el diálogo:

1. Leer las tres secciones completas, no solamente sus títulos.
2. Revisar tanto las tarjetas de traducción (`sN-tNNN`) como las explicaciones
   gramaticales (`sN-gNNN`).
3. Identificar vocabulario, verbos, preguntas, respuestas y estructuras
   disponibles en cada sección.
4. Elegir una situación que permita combinar de manera coherente el contexto de
   las tres secciones.
5. No introducir temas, tiempos verbales ni vocabulario que queden fuera del
   alcance específico del libro. Las palabras de enlace también deben salir del
   material siempre que sea posible.
6. No copiar errores evidentes de las tarjetas: conservar el alcance del libro,
   pero usar alemán gramaticalmente correcto.

Un comando útil para revisar las tarjetas de traducción es:

```bash
for file in src/data/willkommen-vaughan-N/sektion-*.json; do
  node - "$file" <<'NODE'
const fs = require('fs');
const path = process.argv[2];
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log(`\n${data.sektionTitle}`);
for (const card of data.cards.filter((item) => /-t\d+$/.test(item.id))) {
  console.log(`${card.id}\t${card.back}`);
}
NODE
done
```

## Criterios para una conversación natural

- Usar siempre dos personajes consistentes: `Lena` y `Martin`.
- Crear una escena con principio, desarrollo y cierre, no una sucesión de frases
  independientes.
- Hacer que cada respuesta reaccione a la intervención anterior.
- Alternar preguntas, respuestas, comentarios y confirmaciones que ya estén
  respaldados por el material del libro.
- Mantener cada turno en una o dos frases relativamente breves. Esto mejora la
  prosodia de XTTS y evita el límite aproximado de 250 caracteres del modelo.
- Repartir el contenido de manera equilibrada entre las tres secciones.
- Evitar explicaciones metalingüísticas dentro del diálogo: la conversación debe
  sonar como una situación real dentro del nivel del Buch.
- Como referencia, apuntar a 20-30 turnos y unas 220-350 palabras en alemán. El
  criterio definitivo es que el audio dure al menos dos minutos.
- Traducir cada turno al español natural y conservar exactamente el mismo
  significado del alemán.
- Realizar un último control manual para eliminar vocabulario añadido por
  costumbre que no aparezca en las tarjetas del libro.

## Archivo de recursos

Crear `src/resources/buch-N.json` con este esquema:

```json
{
  "bookId": "willkommen-vaughan-N",
  "sektionen": [
    {
      "sektionId": "conversation",
      "sektionTitle": "Conversation",
      "title": "Título en alemán",
      "subtitle": "Resumen breve en español",
      "description": "Descripción del contexto y su relación con Buch N.",
      "duration": "Pendiente",
      "audioSrc": "/audio/buch-N-conversation.m4a",
      "turns": [
        {
          "speaker": "Lena",
          "de": "Texto en alemán.",
          "es": "Traducción al español."
        },
        {
          "speaker": "Martin",
          "de": "Texto en alemán.",
          "es": "Traducción al español."
        }
      ]
    }
  ]
}
```

No cambiar identificadores existentes. El cargador
`src/utils/loadResources.js` descubre automáticamente los archivos JSON de
`src/resources/`.

Validar el JSON antes de sintetizar:

```bash
node -e "JSON.parse(require('fs').readFileSync('src/resources/buch-N.json', 'utf8')); console.log('JSON OK')"
```

## Entorno local de XTTS-v2

Configuración validada en este equipo:

- MacBook Air 2015, Intel Core i5 de dos núcleos y 8 GB de RAM.
- macOS 13.6.7, sin CUDA ni MPS.
- Entorno virtual:
  `/Users/air1320158gb128gb/.venvs/xtts-v2`
- Python 3.11.17.
- `coqui-tts==0.27.5`.
- `torch==2.2.2` y `torchaudio==2.2.2`, últimas versiones con binarios para
  macOS Intel.
- Pines de compatibilidad: `numpy==1.26.4`, `numba==0.60.0`,
  `llvmlite==0.43.0` y `transformers==4.57.6`.

El modelo está fuera del repositorio, en:

```text
/Users/air1320158gb128gb/Library/Application Support/tts/tts_models--multilingual--multi-dataset--xtts_v2/
```

Archivos requeridos:

```text
config.json
hash.md5
model.pth
speakers_xtts.pth
vocab.json
```

Hashes oficiales ya verificados:

```text
model.pth
c7ea20001c6a0a841c77e252d8409f6a74fb423e79b3206a0771ba5989776187

speakers_xtts.pth
f0f6137c19a4eab0cbbe4c99b5babacf68b1746e50da90807708c10e645b943b
```

No incluir el modelo, el entorno virtual ni los WAV temporales en Git. XTTS-v2
usa la Coqui Public Model License (CPML); comprobar que el uso siga cumpliendo
esa licencia. El modelo se descargó después de que el usuario autorizó
expresamente continuar con XTTS-v2.

## Generación del audio

El generador versionado es:

```text
tools/generate-xtts-conversation.py
```

Usa las voces integradas siguientes, sin clonar voces de terceros:

- Lena: `Ana Florence`
- Martin: `Andrew Chipper`

### 1. Prueba opcional de un turno

Usarla cuando cambie el generador, el modelo o el entorno:

```bash
COQUI_TOS_AGREED=1 \
/Users/air1320158gb128gb/.venvs/xtts-v2/bin/python \
tools/generate-xtts-conversation.py \
src/resources/buch-N.json \
/tmp/buch-N-xtts-test.wav \
--max-turns 1
```

### 2. Generación completa

```bash
COQUI_TOS_AGREED=1 /usr/bin/time -l \
/Users/air1320158gb128gb/.venvs/xtts-v2/bin/python \
tools/generate-xtts-conversation.py \
src/resources/buch-N.json \
/tmp/buch-N-conversation-xtts.wav
```

Consideraciones de este hardware:

- La carga inicial tarda aproximadamente un minuto.
- La inferencia funciona en CPU y puede tardar unas seis veces la duración del
  audio, además de la carga inicial.
- Buch 4, con 43 turnos y 4:46 de audio, tardó unos 29 minutos.
- El pico observado fue aproximadamente 4,25 GB de memoria.
- Es adecuado para generación offline, no para conversación en tiempo real.
- Mantener una sola ejecución por libro; así el modelo se carga una vez y se
  reutiliza para todos los turnos.
- Si una ejecución es interrumpida, comprobar que no quede un proceso huérfano
  antes de reiniciarla.

Comprobación de procesos:

```bash
ps -o pid,etime,%cpu,rss,state,command -ax | \
  rg '[p]ython .*generate-xtts-conversation|[t]ime -l .*generate-xtts-conversation'
```

### 3. Inspección del WAV

```bash
afinfo /tmp/buch-N-conversation-xtts.wav | \
  rg 'Data format|estimated duration|audio bytes|bit rate'
```

El WAV esperado es mono, PCM de 16 bits y 24 kHz. Confirmar que la duración sea
de al menos dos minutos.

### 4. Conversión para la web

Usar AAC a 64 kb/s. En este equipo, 128 kb/s falla para el perfil mono de 24
kHz con el error `!dat`.

```bash
afconvert /tmp/buch-N-conversation-xtts.wav \
  -o /tmp/buch-N-conversation-xtts.m4a \
  -f m4af \
  -d 'aac ' \
  -b 64000 \
  -q 127
```

Validar el M4A antes de moverlo al proyecto:

```bash
afinfo /tmp/buch-N-conversation-xtts.m4a | \
  rg 'Data format|estimated duration|audio bytes|bit rate'
```

El archivo debe ser mono, AAC, 24 kHz y conservar la duración del WAV.

### 5. Instalación del audio y duración

Solo después de validar el M4A:

```bash
/bin/mv /tmp/buch-N-conversation-xtts.m4a \
  public/audio/buch-N-conversation.m4a
```

Actualizar `duration` en `src/resources/buch-N.json` con la duración real
redondeada al segundo y escrita como `M:SS`.

## Validaciones obligatorias por libro

Ejecutar todas antes del commit:

```bash
node -e "JSON.parse(require('fs').readFileSync('src/resources/buch-N.json', 'utf8')); console.log('JSON OK')"

/Users/air1320158gb128gb/.venvs/xtts-v2/bin/python \
  -m py_compile tools/generate-xtts-conversation.py

afinfo public/audio/buch-N-conversation.m4a | \
  rg 'Data format|estimated duration|audio bytes|bit rate'

npm run build

git diff --check
```

Comprobar también:

- que `audioSrc` apunte al archivo que realmente existe;
- que los nombres de los personajes coincidan con `Lena` y `Martin`;
- que todos los turnos tengan `speaker`, `de` y `es`;
- que no haya vocabulario fuera del alcance del Buch;
- que la duración indicada coincida con el audio;
- que los archivos no relacionados del árbol de trabajo no entren en el commit.

## Commit y push por iteración

Añadir únicamente los archivos del Buch actual:

```bash
git add -- \
  src/resources/buch-N.json \
  public/audio/buch-N-conversation.m4a

git commit -m "Add Buch N XTTS conversation resource"
git push origin main
```

Si esta guía o el generador cambian como parte de una iteración, incluirlos de
forma explícita. Después del push, verificar que `origin/main` contiene el nuevo
commit antes de iniciar Buch N+1.

## Lista de control resumida

- [ ] Leer esta guía completa.
- [ ] Revisar las tres secciones del Buch.
- [ ] Diseñar una sola escena dentro de su alcance.
- [ ] Escribir alemán correcto y traducción natural al español.
- [ ] Revisar naturalidad, cobertura y vocabulario.
- [ ] Validar el JSON.
- [ ] Generar un único WAV completo con XTTS-v2.
- [ ] Confirmar duración mínima de dos minutos.
- [ ] Convertir a M4A AAC de 64 kb/s.
- [ ] Validar e instalar el audio.
- [ ] Actualizar la duración real.
- [ ] Ejecutar compilación y comprobaciones finales.
- [ ] Hacer commit y push solo del Buch actual.
- [ ] Confirmar el push antes de pasar al siguiente Buch.
