import { Link, useParams } from 'react-router-dom';
import { getBook } from '../utils/loadCards.js';
import { getSektionStats } from '../utils/progress.js';

export default function SektionList() {
  const { bookId } = useParams();
  const book = getBook(bookId);

  if (!book) {
    return (
      <main className="screen">
        <p className="empty">Libro no encontrado.</p>
        <Link to="/" className="back-link">← Volver</Link>
      </main>
    );
  }

  return (
    <main className="screen">
      <header className="screen-header">
        <Link to={book.language === 'en' ? '/?idioma=ingles' : '/'} className="back-link">← {book.language === 'en' ? 'Libros de inglés' : 'Bücher'}</Link>
        <h1>{book.bookTitle}</h1>
        <p className="muted">{book.sektionen.length} {book.language === 'en' ? 'niveles' : 'Sektionen'}</p>
      </header>

      <ul className="card-list">
        {book.sektionen.map((sektion) => {
          const stats = getSektionStats(book.bookId, sektion);
          const pct = stats.total ? Math.round((stats.understood / stats.total) * 100) : 0;
          return (
            <li key={sektion.sektionId}>
              <Link
                className="card-item"
                to={`/buch/${book.bookId}/${book.language === 'en' ? 'nivel' : 'sektion'}/${sektion.sektionId}`}
              >
                <div className="card-item-title">{sektion.sektionTitle}</div>
                <div className="card-item-meta">
                  <span>{stats.total} tarjetas</span>
                  <span>·</span>
                  <span className="ok">{stats.understood} ✓</span>
                  <span>·</span>
                  <span className="warn">{stats.notUnderstood} ✗</span>
                  <span>·</span>
                  <span>{stats.pending} pend.</span>
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
