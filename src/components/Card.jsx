export default function Card({ front, back, flipped, onClick }) {
  return (
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
  );
}
