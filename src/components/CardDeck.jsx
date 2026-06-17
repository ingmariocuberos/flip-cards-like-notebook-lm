import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSektion } from '../utils/loadCards.js';
import { useDeck } from '../hooks/useDeck.js';
import Card from './Card.jsx';

export default function CardDeck() {
  const { bookId, sektionId } = useParams();
  const found = getSektion(bookId, sektionId);
  const [flipped, setFlipped] = useState(false);

  const deck = useDeck({
    bookId,
    sektionId,
    cards: found ? found.sektion.cards : []
  });

  useEffect(() => {
    setFlipped(false);
  }, [deck.currentCard?.id]);

  useEffect(() => {
    function onKey(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setFlipped((f) => !f);
          break;
        case 'ArrowRight':
          deck.next();
          break;
        case 'ArrowLeft':
          deck.prev();
          break;
        case '1':
          deck.markNotUnderstood();
          break;
        case '2':
          deck.markUnderstood();
          break;
        default:
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deck]);

  if (!found) {
    return (
      <main className="screen">
        <p className="empty">Sektion no encontrada.</p>
        <Link to="/" className="back-link">← Volver</Link>
      </main>
    );
  }

  const { book, sektion } = found;

  function handleReset() {
    if (window.confirm('¿Reiniciar todo el progreso de esta Sektion?')) {
      deck.resetProgress();
      setFlipped(false);
    }
  }

  return (
    <main className="screen deck-screen">
      <header className="screen-header">
        <Link to={`/buch/${book.bookId}`} className="back-link">
          ← {book.bookTitle}
        </Link>
        <h1>{sektion.sektionTitle}</h1>
        <div className="deck-meta">
          <span>{deck.stats.total} tarjetas</span>
          <span>·</span>
          <span className="ok">{deck.stats.understood} entendidas</span>
          <span>·</span>
          <span className="warn">{deck.stats.notUnderstood} no entendidas</span>
          <span>·</span>
          <span>{deck.stats.pending} pendientes</span>
        </div>
      </header>

      <div className="deck-controls">
        <div className="filter-toggle" role="tablist" aria-label="Filtro">
          <button
            role="tab"
            aria-selected={deck.filter === 'all'}
            className={deck.filter === 'all' ? 'active' : ''}
            onClick={() => deck.setFilter('all')}
          >
            Todas
          </button>
          <button
            role="tab"
            aria-selected={deck.filter === 'not_understood'}
            className={deck.filter === 'not_understood' ? 'active' : ''}
            onClick={() => deck.setFilter('not_understood')}
          >
            Solo no entendidas
          </button>
        </div>

        <div className="deck-actions">
          <button onClick={deck.shuffle}>Mezclar</button>
          <button className="danger" onClick={handleReset}>Reiniciar</button>
        </div>
      </div>

      <div className="deck-counter">
        {deck.totalVisible === 0
          ? 'Sin tarjetas en este filtro'
          : `${Math.min(deck.position + 1, deck.totalVisible)} / ${deck.totalVisible}`}
      </div>

      {deck.completed ? (
        <div className="completed">
          <p>¡Mazo completado!</p>
          <div className="completed-actions">
            <button onClick={() => deck.shuffle()}>Mezclar y reiniciar</button>
            <button className="danger" onClick={handleReset}>Reiniciar progreso</button>
          </div>
        </div>
      ) : deck.currentCard ? (
        <>
          <Card
            front={deck.currentCard.front}
            back={deck.currentCard.back}
            flipped={flipped}
            onClick={() => setFlipped((f) => !f)}
          />

          <div className="deck-buttons">
            <button className="warn-btn" onClick={deck.markNotUnderstood}>
              No entendí <kbd>1</kbd>
            </button>
            <button className="nav-btn" onClick={deck.prev} aria-label="Anterior">
              ← <kbd>←</kbd>
            </button>
            <button className="nav-btn" onClick={deck.next} aria-label="Siguiente">
              <kbd>→</kbd> →
            </button>
            <button className="ok-btn" onClick={deck.markUnderstood}>
              Entendí <kbd>2</kbd>
            </button>
          </div>

          <div className="deck-hint muted">
            <kbd>Espacio</kbd> voltea · <kbd>←</kbd>/<kbd>→</kbd> navega ·{' '}
            <kbd>1</kbd> no entendí · <kbd>2</kbd> entendí
          </div>
        </>
      ) : null}
    </main>
  );
}
