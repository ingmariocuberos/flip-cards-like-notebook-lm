const PREFIX = 'flashcards:';
const FORMAT = 'tarjetas-didacticas-progress';
const VERSION = 1;

export function readProgressEntries(storage) {
  return Object.fromEntries(
    Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter((key) => key?.startsWith(PREFIX))
      .sort()
      .map((key) => [key, storage.getItem(key)])
  );
}

export function createProgressBackup(storage) {
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    entries: readProgressEntries(storage),
  };
}

export function parseProgressBackup(text) {
  let backup;
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error('El archivo no contiene un JSON válido.');
  }

  if (backup?.format !== FORMAT || backup.version !== VERSION ||
      !backup.entries || Array.isArray(backup.entries) || typeof backup.entries !== 'object') {
    throw new Error('Este archivo no es una copia de progreso compatible.');
  }

  for (const [key, value] of Object.entries(backup.entries)) {
    if (!key.startsWith(PREFIX) || typeof value !== 'string') {
      throw new Error('La copia contiene datos de progreso no válidos.');
    }
    try {
      JSON.parse(value);
    } catch {
      throw new Error(`El dato ${key} está dañado.`);
    }
  }

  return backup.entries;
}

export function restoreProgressEntries(storage, entries) {
  const previous = readProgressEntries(storage);
  const replace = (values) => {
    Object.keys(readProgressEntries(storage)).forEach((key) => storage.removeItem(key));
    Object.entries(values).forEach(([key, value]) => storage.setItem(key, value));
  };

  try {
    replace(entries);
  } catch (error) {
    replace(previous);
    throw error;
  }
}
