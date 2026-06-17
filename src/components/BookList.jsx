import { Link } from 'react-router-dom';
import { getBooks } from '../utils/loadCards.js';
import { getBookStats } from '../utils/progress.js';

export default function BookList() {
  const books = getBooks();

  return (
    <main className="screen">
      <header className="screen-header">
        <h1>Tarjetas didácticas</h1>
        <p className="muted">Deutsch · Bücher</p>
      </header>

      {books.length === 0 ? (
        <p className="empty">
          No hay JSONs cargados todavía. Genera tarjetas en <code>src/data/</code>.
        </p>
      ) : (
        <ul className="card-list">
          {books.map((book) => {
            const stats = getBookStats(book);
            const pct = stats.total ? Math.round((stats.understood / stats.total) * 100) : 0;
            return (
              <li key={book.bookId}>
                <Link className="card-item" to={`/buch/${book.bookId}`}>
                  <div className="card-item-title">{book.bookTitle}</div>
                  <div className="card-item-meta">
                    <span>{book.sektionen.length} Sektionen</span>
                    <span>·</span>
                    <span>{stats.total} tarjetas</span>
                    <span>·</span>
                    <span>{pct}% entendido</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
