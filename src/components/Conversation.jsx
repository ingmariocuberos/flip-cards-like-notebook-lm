import { Link, useParams } from 'react-router-dom';
import { getResourceSektion } from '../utils/loadResources.js';

export default function Conversation() {
  const { bookId, sektionId } = useParams();
  const found = getResourceSektion(bookId, sektionId);

  if (!found) {
    return (
      <main className="screen">
        <p className="empty">Recurso no encontrado.</p>
        <Link to="/resources" className="back-link">← Audio/Visual Resources</Link>
      </main>
    );
  }

  const { book, sektion } = found;

  return (
    <main className="screen conversation-screen">
      <header className="screen-header">
        <Link to={`/resources/buch/${book.bookId}`} className="back-link">
          ← {book.bookTitle}
        </Link>
        <h1>{sektion.sektionTitle}</h1>
        <p className="muted">{sektion.subtitle}</p>
      </header>

      <section className="audio-panel" aria-labelledby="audio-title">
        <div>
          <span className="resource-kicker">Hörtraining</span>
          <h2 id="audio-title">{sektion.title}</h2>
          <p>{sektion.description}</p>
        </div>
        <audio controls preload="metadata" src={sektion.audioSrc}>
          Tu navegador no puede reproducir este audio.
        </audio>
        <div className="audio-meta muted">
          <span>Duración: {sektion.duration}</span>
          <span>·</span>
          <span>Velocidad natural lenta</span>
        </div>
      </section>

      <section className="transcript" aria-labelledby="transcript-title">
        <div className="transcript-heading">
          <div>
            <span className="resource-kicker">Mitlesen</span>
            <h2 id="transcript-title">Transcripción bilingüe</h2>
          </div>
          <span className="muted">Deutsch · Español</span>
        </div>

        <ol className="dialogue-list">
          {sektion.turns.map((turn, index) => (
            <li className="dialogue-turn" key={`${turn.speaker}-${index}`}>
              <div className={`speaker-avatar speaker-${turn.speaker.toLowerCase()}`} aria-hidden="true">
                {turn.speaker.charAt(0)}
              </div>
              <div className="dialogue-copy">
                <span className="speaker-name">{turn.speaker}</span>
                <p lang="de">{turn.de}</p>
                <p className="translation" lang="es">{turn.es}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
