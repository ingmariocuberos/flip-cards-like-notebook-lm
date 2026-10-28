import { Link } from 'react-router-dom';
import { getBooks } from '../utils/loadCards.js';
import { getBookStats } from '../utils/progress.js';
import LibraryTabs from './LibraryTabs.jsx';
import { getUnderstoodCards, readReviewState, reconcileReviewState, REVIEW_SIZE } from '../utils/review.js';

export default function BookList() {
  const books = getBooks();
  const understoodCards = getUnderstoodCards();
  const review = reconcileReviewState(readReviewState(), understoodCards);
  const activeReview = review.session && review.session.index < review.session.ids.length;

  return (
    <main className="screen">
      <header className="screen-header library-header">
        <h1>Tarjetas didácticas</h1>
        <p className="muted">Deutsch · Bücher</p>
        <LibraryTabs />
      </header>

      <section className="review-entry" aria-labelledby="review-entry-title">
        <div>
          <h2 id="review-entry-title">Repaso rápido</h2>
          <p>
            {understoodCards.size === 0
              ? 'Marca tarjetas como entendidas para activar este repaso.'
              : `${Math.min(REVIEW_SIZE, understoodCards.size)} tarjetas al azar de ${understoodCards.size} entendidas.`}
          </p>
        </div>
        {understoodCards.size > 0 && (
          <Link className="button-link review-entry-action" to="/review">
            {activeReview ? 'Continuar repaso' : 'Empezar repaso'}
          </Link>
        )}
      </section>

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
