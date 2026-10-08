import { Link } from 'react-router-dom';
import { getResourceBooks } from '../utils/loadResources.js';
import LibraryTabs from './LibraryTabs.jsx';

export default function ResourceBookList() {
  const books = getResourceBooks();

  return (
    <main className="screen">
      <header className="screen-header library-header">
        <h1>Tarjetas didácticas</h1>
        <p className="muted">Deutsch · Bücher</p>
        <LibraryTabs />
      </header>

      <ul className="card-list">
        {books.map((book) => (
          <li key={book.bookId}>
            <Link className="card-item" to={`/resources/buch/${book.bookId}`}>
              <div className="card-item-title">{book.bookTitle}</div>
              <div className="card-item-meta resource-book-meta">
                <span>
                  {book.sektionen.length}{' '}
                  {book.sektionen.length === 1 ? 'Sektion' : 'Sektionen'}
                </span>
                <span>·</span>
                <span>{book.sektionen.length ? 'Audio y transcripción' : 'Próximamente'}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
