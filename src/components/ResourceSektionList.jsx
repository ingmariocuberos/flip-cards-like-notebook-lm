import { Link, useParams } from 'react-router-dom';
import { getResourceBook } from '../utils/loadResources.js';
import { practiceStorageKey, readPracticeState, reconcilePracticeState } from '../utils/practice.js';

export default function ResourceSektionList() {
  const { bookId } = useParams();
  const book = getResourceBook(bookId);

  if (!book) {
    return (
      <main className="screen">
        <p className="empty">Libro no encontrado.</p>
        <Link to="/resources" className="back-link">← Audio/Visual Resources</Link>
      </main>
    );
  }

  return (
    <main className="screen">
      <header className="screen-header">
        <Link to="/resources" className="back-link">← Audio/Visual Resources</Link>
        <h1>{book.bookTitle}</h1>
        <p className="muted">Escucha y practica las conversaciones de este libro.</p>
      </header>

      {book.sektionen.length === 0 ? (
        <p className="empty">Los recursos de este libro se añadirán próximamente.</p>
      ) : (
        <ul className="card-list">
          {book.sektionen.flatMap((sektion) => {
            const saved = reconcilePracticeState(
              readPracticeState(practiceStorageKey(book.bookId, sektion.sektionId)),
              sektion.turns
            );
            const active = saved.session && saved.session.position < saved.session.indices.length;
            return [
              <li key={sektion.sektionId}>
                <Link
                  className="card-item resource-card"
                  to={`/resources/buch/${book.bookId}/${sektion.sektionId}`}
                >
                  <div className="card-item-title">Escuchar conversación</div>
                  <div className="card-item-meta">
                    <span>Audio · {sektion.duration}</span>
                    <span>·</span>
                    <span>{sektion.turns.length} intervenciones</span>
                  </div>
                  <p className="resource-description">{sektion.description}</p>
                </Link>
              </li>,
              <li key={`${sektion.sektionId}-practice`}>
                <Link
                  className="card-item resource-card practice-entry"
                  to={`/resources/buch/${book.bookId}/${sektion.sektionId}/practice`}
                >
                  <div className="card-item-title">Tu turno</div>
                  <div className="card-item-meta resource-book-meta">
                    <span>{active ? `Continuar · intervención ${saved.session.position + 1} de ${saved.session.indices.length}` : '5 intervenciones · práctica oral'}</span>
                  </div>
                  <p className="resource-description">Responde a los personajes y compara tu frase con la conversación.</p>
                </Link>
              </li>
            ];
          })}
        </ul>
      )}
    </main>
  );
}
