import { Link, useParams } from 'react-router-dom';
import { getResourceBook } from '../utils/loadResources.js';

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
        <p className="muted">
          {book.sektionen.length}{' '}
          {book.sektionen.length === 1 ? 'Sektion' : 'Sektionen'}
        </p>
      </header>

      {book.sektionen.length === 0 ? (
        <p className="empty">Los recursos de este libro se añadirán próximamente.</p>
      ) : (
        <ul className="card-list">
          {book.sektionen.map((sektion) => (
            <li key={sektion.sektionId}>
              <Link
                className="card-item resource-card"
                to={`/resources/buch/${book.bookId}/${sektion.sektionId}`}
              >
                <div className="card-item-title">{sektion.sektionTitle}</div>
                <div className="card-item-meta">
                  <span>Audio · {sektion.duration}</span>
                  <span>·</span>
                  <span>{sektion.turns.length} intervenciones</span>
                </div>
                <p className="resource-description">{sektion.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
