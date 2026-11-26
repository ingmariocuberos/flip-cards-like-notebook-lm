import { useEffect, useState } from 'react';

export default function Card({ front, back, flipped, onClick }) {
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    setCopyStatus('');
  }, [front, back]);

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(`Anverso: ${front}\nReverso: ${back}\nY mi pregunta es:`);
      setCopyStatus('Copiado');
    } catch {
      setCopyStatus('No se pudo copiar. Inténtalo de nuevo.');
    }
  }

  return (
    <>
      <div className="flashcard-toolbar">
        <span role="status">{copyStatus}</span>
        <button type="button" onClick={copyCard} onKeyDown={(event) => event.stopPropagation()}>
          Copiar
        </button>
      </div>
      <div
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onClick();
        }}
        aria-label="Tarjeta — click para voltear"
      >
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <div className="flashcard-content">{front}</div>
            <div className="flashcard-hint">Click para ver respuesta</div>
          </div>
          <div className="flashcard-face flashcard-back">
            <div className="flashcard-content">{back}</div>
            <div className="flashcard-hint">Click para volver</div>
          </div>
        </div>
      </div>
    </>
  );
}
