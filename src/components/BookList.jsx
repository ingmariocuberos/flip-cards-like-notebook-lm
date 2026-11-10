import { Link, useSearchParams } from 'react-router-dom';
import { getBooks } from '../utils/loadCards.js';
import { getBookStats } from '../utils/progress.js';
import LibraryTabs from './LibraryTabs.jsx';
import { getUnderstoodCards, readReviewState, reconcileReviewState, REVIEW_SIZE } from '../utils/review.js';

export default function BookList() {
  const [searchParams] = useSearchParams();
  const language = searchParams.get('idioma') === 'ingles' ? 'en' : 'de';
  const books = getBooks().filter((book) => book.language === language);
  const understoodCards = getUnderstoodCards(language);
  const review = reconcileReviewState(readReviewState(language), understoodCards);
  const activeReview = review.session && review.session.index < review.session.ids.length;

  return (
    <main className="screen">
      <header className="screen-header library-header">
        <h1>Tarjetas didácticas</h1>
        <p className="muted">{language === 'en' ? 'English · Books' : 'Deutsch · Bücher'}</p>
        <LibraryTabs />
        <nav className="language-tabs" aria-label="Idioma de las tarjetas">
          <Link className={language === 'de' ? 'active' : ''} to="/">Alemán</Link>
          <Link className={language === 'en' ? 'active' : ''} to="/?idioma=ingles">Inglés</Link>
        </nav>
      </header>

      <section className="review-entry" aria-labelledby="review-entry-title">
        <div>
          <h2 id="review-entry-title">Repaso rápido</h2>
          <p>
            {understoodCards.size === 0
              ? 'Marca tarjetas como entendidas para activar este repaso.'
              : `${Math.min(REVIEW_SIZE, understoodCards.size)} ${Math.min(REVIEW_SIZE, understoodCards.size) === 1 ? 'tarjeta' : 'tarjetas'} al azar de ${understoodCards.size} ${understoodCards.size === 1 ? 'entendida' : 'entendidas'}.`}
          </p>
        </div>
        {understoodCards.size > 0 && (
          <Link className="button-link review-entry-action" to={language === 'en' ? '/review?idioma=ingles' : '/review'}>
            {activeReview ? 'Continuar repaso' : 'Empezar repaso'}
          </Link>
        )}
      </section>

      {books.length === 0 ? (
        <p className="empty">
              Aún no hay libros de este idioma.
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
                    <span>{book.sektionen.length} {language === 'en' ? 'niveles' : 'Sektionen'}</span>
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
