import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getResourceSektion } from '../utils/loadResources.js';
import {
  getPracticeHint,
  practiceStorageKey,
  readPracticeState,
  reconcilePracticeState,
  repeatDifficultTurns,
  startPractice
} from '../utils/practice.js';

const RATINGS = [
  { value: 'independent', label: 'Me salió' },
  { value: 'hint', label: 'Necesité pista' },
  { value: 'retry', label: 'No me salió' }
];

function PracticeSession({ book, sektion }) {
  const key = practiceStorageKey(book.bookId, sektion.sektionId);
  const [practice, setPractice] = useState(() => {
    const saved = reconcilePracticeState(readPracticeState(key), sektion.turns);
    return saved.session && saved.session.position < saved.session.indices.length
      ? saved
      : startPractice(saved, sektion.turns);
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(practice));
    } catch (error) {
      console.warn('[practice] failed to save progress:', error);
    }
  }, [key, practice]);

  const session = practice.session;
  const completed = session && session.position >= session.indices.length;
  const turnIndex = completed ? null : session?.indices[session.position];
  const previous = sektion.turns[turnIndex - 1];
  const target = sektion.turns[turnIndex];

  function setPhase(phase) {
    setPractice((current) => ({
      ...current,
      session: { ...current.session, phase }
    }));
  }

  function rate(rating) {
    setPractice((current) => {
      const { indices, position, ratings } = current.session;
      return {
        ...current,
        session: {
          ...current.session,
          position: position + 1,
          phase: 'prompt',
          ratings: { ...ratings, [indices[position]]: rating }
        }
      };
    });
  }

  const counts = completed
    ? RATINGS.map(({ value }) => Object.values(session.ratings).filter((rating) => rating === value).length)
    : [];

  return (
    <main className="screen practice-screen">
      <header className="screen-header">
        <Link to={`/resources/buch/${book.bookId}`} className="back-link">← {book.bookTitle}</Link>
        <span className="resource-kicker">Conversación activa</span>
        <h1>Tu turno</h1>
        <p className="muted">Di tu respuesta en alemán antes de descubrir cómo respondió el personaje.</p>
      </header>

      {!session ? (
        <p className="empty">Esta conversación todavía no tiene intervenciones para practicar.</p>
      ) : completed ? (
        <section className="practice-complete">
          <h2>¡Terminaste la ronda!</h2>
          <p>Tu evaluación: {counts[0]} sin ayuda · {counts[1]} con pista · {counts[2]} para practicar de nuevo.</p>
          <p className="muted">Escucha ahora la conversación completa e identifica las respuestas que practicaste.</p>
          <audio controls preload="metadata" src={sektion.audioSrc}>
            Tu navegador no puede reproducir este audio.
          </audio>
          <div className="completed-actions">
            {counts[1] + counts[2] > 0 && (
              <button onClick={() => setPractice(repeatDifficultTurns)}>
                Repetir las que costaron ({counts[1] + counts[2]})
              </button>
            )}
            <button onClick={() => setPractice((current) => startPractice(current, sektion.turns))}>
              Nueva ronda
            </button>
            <Link className="button-link" to={`/resources/buch/${book.bookId}/${sektion.sektionId}`}>
              Ver transcripción
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="practice-progress">
            <span>Intervención {session.position + 1} de {session.indices.length}</span>
            <div className="progress" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${session.position / session.indices.length * 100}%` }} />
            </div>
          </div>

          <section className="practice-scene" aria-labelledby="practice-scene-title">
            <span className="resource-kicker">La escena</span>
            <h2 id="practice-scene-title">{previous.speaker} dice:</h2>
            <p lang="de">{previous.de}</p>
            <p className="practice-translation" lang="es">{previous.es}</p>
          </section>

          <section className="practice-prompt" aria-labelledby="practice-prompt-title">
            <span className="resource-kicker">Ahora tú</span>
            <h2 id="practice-prompt-title">Responde como {target.speaker}</h2>
            <p lang="es">{target.es}</p>
            <p className="muted">Inténtalo en voz alta. Tu frase puede ser distinta si expresa la misma idea.</p>

            {session.phase === 'hint' && (
              <p className="practice-hint">Empieza con: <span lang="de">{getPracticeHint(target.de)}</span></p>
            )}

            {session.phase !== 'answer' ? (
              <div className="practice-actions">
                {session.phase === 'prompt' && <button onClick={() => setPhase('hint')}>Necesito una pista</button>}
                <button className="practice-primary" onClick={() => setPhase('answer')}>Mostrar respuesta</button>
              </div>
            ) : (
              <div className="practice-answer">
                <span className="resource-kicker">Respuesta de {target.speaker}</span>
                <p lang="de">{target.de}</p>
                <p className="muted">¿Cómo te fue? Elige una opción para continuar.</p>
                <div className="practice-ratings">
                  {RATINGS.map(({ value, label }) => (
                    <button key={value} onClick={() => rate(value)}>{label}</button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default function PracticeConversation() {
  const { bookId, sektionId } = useParams();
  const found = getResourceSektion(bookId, sektionId);

  if (!found) {
    return (
      <main className="screen">
        <p className="empty">Conversación no encontrada.</p>
        <Link to="/resources" className="back-link">← Audio/Visual Resources</Link>
      </main>
    );
  }

  return <PracticeSession key={`${bookId}:${sektionId}`} {...found} />;
}
