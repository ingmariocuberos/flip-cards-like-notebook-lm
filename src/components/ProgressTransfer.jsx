import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createProgressBackup, parseProgressBackup, readProgressEntries, restoreProgressEntries } from '../utils/progressTransfer.js';

export default function ProgressTransfer() {
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const exportProgress = () => {
    try {
      const backup = createProgressBackup(window.localStorage);
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tarjetas-didacticas-progreso-${backup.exportedAt.slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError(false);
      setMessage(`Copia descargada con ${Object.keys(backup.entries).length} registros de progreso.`);
    } catch {
      setError(true);
      setMessage('No se pudo crear la copia. Comprueba que el almacenamiento del navegador esté disponible.');
    }
  };

  const importProgress = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const entries = parseProgressBackup(await file.text());
      const incomingCount = Object.keys(entries).length;
      const currentCount = Object.keys(readProgressEntries(window.localStorage)).length;
      if (!window.confirm(`Se importarán ${incomingCount} registros. Esto reemplazará los ${currentCount} registros de progreso guardados en este navegador. ¿Continuar?`)) return;

      restoreProgressEntries(window.localStorage, entries);
      window.location.reload();
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : 'No se pudo importar el progreso.');
    }
  };

  return (
    <main className="screen">
      <Link className="back-link" to="/">← Biblioteca</Link>
      <header className="screen-header">
        <h1>Guardar y recuperar progreso</h1>
        <p className="muted">Lleva tus tarjetas y repasos a otro navegador o computadora.</p>
      </header>

      <section className="transfer-panel">
        <h2>1. Exportar</h2>
        <p>Descarga un archivo JSON con todo el progreso guardado por esta aplicación en este navegador.</p>
        <button type="button" onClick={exportProgress}>Descargar progreso</button>
      </section>

      <section className="transfer-panel">
        <h2>2. Importar</h2>
        <p>En la otra computadora, abre esta página y selecciona el archivo. Se reemplazará el progreso local después de tu confirmación.</p>
        <button type="button" onClick={() => inputRef.current?.click()}>Seleccionar archivo</button>
        <input ref={inputRef} type="file" accept=".json,application/json" onChange={importProgress} hidden />
      </section>

      {message && <p className={error ? 'transfer-message error' : 'transfer-message'} role="status">{message}</p>}
    </main>
  );
}
