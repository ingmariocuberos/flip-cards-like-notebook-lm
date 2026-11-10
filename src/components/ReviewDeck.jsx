import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from './Card.jsx';
import {
  getUnderstoodCards,
  readReviewState,
  reconcileReviewState,
  reviewKey,
  startReview
} from '../utils/review.js';

export default function ReviewDeck() {
  const [searchParams] = useSearchParams();
  const language = searchParams.get('idioma') === 'ingles' ? 'en' : 'de';
  const backTo = language === 'en' ? '/?idioma=ingles' : '/';
  const cards = useMemo(() => getUnderstoodCards(language), [language]);
  const [review, setReview] = useState(() => {
    const saved = reconcileReviewState(readReviewState(language), cards);
    return saved.session && saved.session.index < saved.session.ids.length
      ? saved
      : startReview(saved, cards);
  });
  const [flipped, setFlipped] = useState(false);
  const session = review.session;
  const currentKey = session?.ids[session.index];
  const currentCard = cards.get(currentKey);
  const completed = session && session.index >= session.ids.length;

  useEffect(() => {
    try {
      window.localStorage.setItem(reviewKey(language), JSON.stringify(review));
    } catch (error) {
      console.warn('[review] failed to save progress:', error);
    }
  }, [review, language]);

  useEffect(() => {
    setFlipped(false);
  }, [currentKey]);

  function move(amount) {
    setReview((current) => ({
      ...current,
      session: {
        ...current.session,
        index: Math.max(0, Math.min(current.session.ids.length, current.session.index + amount))
      }
    }));
  }

  useEffect(() => {
    function onKey(event) {
      if (event.target?.closest('button, a, input, textarea')) return;
      if (event.key === ' ') {
        event.preventDefault();
        if (currentCard) setFlipped((value) => !value);
      } else if (event.key === 'ArrowRight' && currentCard) {
        move(1);
      } else if (event.key === 'ArrowLeft' && session && session.index > 0) {
        move(-1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentCard, session]);

  return (
    <main className="screen deck-screen">
      <header className="screen-header">
        <Link to={backTo} className="back-link">← Tarjetas didácticas</Link>
        <h1>Repaso rápido</h1>
        <p className="muted">Tarjetas entendidas de tus libros de {language === 'en' ? 'inglés' : 'alemán'}.</p>
      </header>

      {!session ? (
        <p className="empty">Marca algunas tarjetas como entendidas para comenzar un repaso.</p>
      ) : completed ? (
        <div className="completed">
          <p>¡Repaso completado!</p>
          <div className="completed-actions">
            <button onClick={() => setReview((current) => startReview(current, cards))}>
              Nuevo repaso
            </button>
            <Link to={backTo} className="button-link">Volver al inicio</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="deck-counter">{session.index + 1} / {session.ids.length}</div>
          <p className="review-source">{currentCard.bookTitle} · {currentCard.sektionTitle}</p>
          {currentCard.sourcePage && <p className="source-page">Página {currentCard.sourcePage} del PDF</p>}
          <Card
            front={currentCard.front}
            back={currentCard.back}
            flipped={flipped}
            onClick={() => setFlipped((value) => !value)}
          />
          <div className="review-navigation">
            <button onClick={() => move(-1)} disabled={session.index === 0}>
              ← Anterior
            </button>
            <button className="review-next" onClick={() => move(1)}>
              {session.index === session.ids.length - 1 ? 'Terminar repaso' : 'Siguiente →'}
            </button>
          </div>
          <p className="deck-hint muted">
            <kbd>Espacio</kbd> voltea · <kbd>←</kbd>/<kbd>→</kbd> navega
          </p>
        </>
      )}
    </main>
  );
}
