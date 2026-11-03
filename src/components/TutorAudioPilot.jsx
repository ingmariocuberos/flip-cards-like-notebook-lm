import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSektion } from '../utils/loadCards.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import pilot from '../tutorAudioPilot.json';

const found = getSektion(pilot.bookId, pilot.sektionId);
const cardsById = new Map(found?.sektion.cards.map((card) => [card.id, card]) ?? []);
const storageKey = `flashcards:tutor-audio-pilot:v1:${pilot.bookId}:${pilot.sektionId}`;

export default function TutorAudioPilot() {
  const audioRef = useRef(null);
  const [position, setPosition] = useLocalStorage(`${storageKey}:position`, 0);
  const [ratings, setRatings] = useLocalStorage(`${storageKey}:ratings`, {});
  const [reviewIds, setReviewIds] = useLocalStorage(`${storageKey}:reviewIds`, null);
  const [audioFinished, setAudioFinished] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const activeItems = reviewIds
    ? pilot.items.filter(({ cardId }) => reviewIds.includes(cardId))
    : pilot.items;
  const item = activeItems[position];
  const card = item && cardsById.get(item.cardId);

  useEffect(() => {
    audioRef.current?.pause();
    setAudioFinished(false);
    setAudioError(false);
    setFlipped(false);
    setPlaying(false);
  }, [item?.cardId]);

  function playTutor() {
    const audio = audioRef.current;
    if (!audio || !item) return;
    setAudioError(false);
    setAudioFinished(false);
    setFlipped(false);
    audio.pause();
    try {
      audio.currentTime = 0;
      audio.play().catch(() => setAudioError(true));
    } catch {
      setAudioError(true);
    }
  }

  function rate(value) {
    if (!card || !flipped) return;
    setRatings((current) => ({ ...current, [card.id]: value }));
    setPosition((current) => current + 1);
  }

  function restart(ids = null) {
    setReviewIds(ids);
    setPosition(0);
  }

  if (!found) return <main className="screen"><p>El piloto no está disponible.</p></main>;

  const understood = pilot.items.filter(({ cardId }) => ratings[cardId] === 'understood').length;
  const notUnderstood = pilot.items.filter(({ cardId }) => ratings[cardId] === 'not_understood').length;

  return (
    <main className="screen deck-screen tutor-pilot-screen">
      <header className="screen-header">
        <Link to={`/resources/buch/${pilot.bookId}`} className="back-link">← Buch 11</Link>
        <span className="resource-kicker">Audio del CD 43 · Sektion 3</span>
        <h1>Practica con la tutora</h1>
        <p className="muted">Escucha a la tutora, responde en alemán y comprueba tu respuesta. Algunos audios incluyen sus aclaraciones antes de la frase.</p>
        <div className="deck-meta">
          <span>{pilot.items.length} preguntas</span><span>·</span>
          <span className="ok">{understood} entendidas</span><span>·</span>
          <span className="warn">{notUnderstood} no entendidas</span>
        </div>
      </header>

      {item && card ? (
        <>
          <p className="deck-counter">
            {reviewIds ? 'Repaso · ' : ''}Pregunta {position + 1} de {activeItems.length}
          </p>
          <section className="practice-scene tutor-pilot-audio">
            <span className="resource-kicker">La tutora te pregunta</span>
            <audio
              ref={audioRef}
              preload="metadata"
              src={item.audioSrc}
              onEnded={() => setAudioFinished(true)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setAudioError(true)}
            />
            <button className="practice-audio-button" onClick={playTutor}>
              {playing ? '↻ Repetir pregunta' : audioFinished ? '↻ Escuchar de nuevo' : '▶ Escuchar pregunta'}
            </button>
            {audioError && (
              <p className="muted">
                No se pudo reproducir el audio local del piloto.{' '}
                <button onClick={() => setAudioFinished(true)}>Continuar sin audio</button>
              </p>
            )}
          </section>

          {audioFinished && (
            <>
              <div className="tutor-pilot-card">
                <span className="resource-kicker">{flipped ? 'Respuesta en alemán' : 'Tu turno'}</span>
                <p lang={flipped ? 'de' : 'es'}>{flipped ? card.back : card.front}</p>
                <button onClick={() => setFlipped((value) => !value)}>
                  {flipped ? 'Ver pregunta' : 'Voltear tarjeta'}
                </button>
              </div>
              {flipped && (
                <div className="deck-buttons">
                  <button className="warn-btn" onClick={() => rate('not_understood')}>No entendí</button>
                  <button className="ok-btn" onClick={() => rate('understood')}>Entendí</button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="completed">
          <p>Terminaste las preguntas disponibles.</p>
          <p>{understood} entendidas · {notUnderstood} para repasar</p>
          <button onClick={() => restart()}>Repetir todas</button>
          {notUnderstood > 0 && (
            <button onClick={() => restart(pilot.items
              .filter(({ cardId }) => ratings[cardId] === 'not_understood')
              .map(({ cardId }) => cardId))}>
              Repasar no entendidas
            </button>
          )}
        </div>
      )}
    </main>
  );
}
