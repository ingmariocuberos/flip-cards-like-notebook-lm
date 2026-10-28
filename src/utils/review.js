import { getBooks } from './loadCards.js';
import { readStatus } from './progress.js';
import { shuffle } from './shuffle.js';

export const REVIEW_KEY = 'flashcards:review:v1';
export const REVIEW_SIZE = 10;

export function getUnderstoodCards() {
  const cards = new Map();

  for (const book of getBooks()) {
    for (const sektion of book.sektionen) {
      const status = readStatus(book.bookId, sektion.sektionId);
      for (const card of sektion.cards) {
        if (status[card.id] !== 'understood') continue;
        const key = JSON.stringify([book.bookId, sektion.sektionId, card.id]);
        cards.set(key, {
          ...card,
          key,
          bookTitle: book.bookTitle,
          sektionTitle: sektion.sektionTitle
        });
      }
    }
  }

  return cards;
}

export function readReviewState() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(REVIEW_KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

export function reconcileReviewState(saved, cards) {
  const seen = Array.isArray(saved?.seen)
    ? [...new Set(saved.seen.filter((key) => cards.has(key)))]
    : [];
  const savedSession = saved.session;
  if (!savedSession || !Array.isArray(savedSession.ids)) return { seen, session: null };

  const ids = [...new Set(savedSession.ids.filter((key) => cards.has(key)))];
  if (ids.length === 0) return { seen, session: null };
  const index = Number.isInteger(savedSession.index)
    ? Math.max(0, Math.min(savedSession.index, ids.length))
    : 0;
  return { seen, session: { ids, index } };
}

export function startReview(state, cards) {
  const keys = [...cards.keys()];
  if (keys.length === 0) return { seen: [], session: null };

  const limit = Math.min(REVIEW_SIZE, keys.length);
  const seen = new Set(state.seen);
  const remaining = shuffle(keys.filter((key) => !seen.has(key)));
  const selected = remaining.slice(0, limit);

  if (selected.length < limit) {
    const selectedSet = new Set(selected);
    const nextRound = shuffle(keys.filter((key) => !selectedSet.has(key)));
    selected.push(...nextRound.slice(0, limit - selected.length));
    return { seen: selected, session: { ids: selected, index: 0 } };
  }

  return {
    seen: [...seen, ...selected],
    session: { ids: selected, index: 0 }
  };
}
