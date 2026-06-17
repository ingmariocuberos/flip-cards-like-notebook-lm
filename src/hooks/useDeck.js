import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { shuffle as shuffleArray } from '../utils/shuffle.js';

function reconcileOrder(savedOrder, cardIds) {
  const cardIdSet = new Set(cardIds);
  const kept = savedOrder.filter((id) => cardIdSet.has(id));
  const known = new Set(kept);
  const appended = cardIds.filter((id) => !known.has(id));
  return [...kept, ...appended];
}

export function useDeck({ bookId, sektionId, cards }) {
  const cardIds = useMemo(() => cards.map((c) => c.id), [cards]);
  const cardsById = useMemo(() => {
    const m = {};
    for (const c of cards) m[c.id] = c;
    return m;
  }, [cards]);

  const baseKey = `flashcards:${bookId}:${sektionId}`;
  const [savedOrder, setSavedOrder] = useLocalStorage(`${baseKey}:order`, []);
  const [index, setIndex] = useLocalStorage(`${baseKey}:index`, 0);
  const [status, setStatus] = useLocalStorage(`${baseKey}:status`, {});
  const [filter, setFilterRaw] = useLocalStorage(`${baseKey}:filter`, 'all');

  const order = useMemo(() => reconcileOrder(savedOrder, cardIds), [savedOrder, cardIds]);

  useEffect(() => {
    const differs =
      savedOrder.length !== order.length || savedOrder.some((id, i) => id !== order[i]);
    if (differs) setSavedOrder(order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const visibleOrder = useMemo(() => {
    if (filter === 'not_understood') {
      return order.filter((id) => status[id] === 'not_understood');
    }
    return order;
  }, [order, status, filter]);

  const completed = visibleOrder.length === 0 || index >= visibleOrder.length;
  const safeIndex = Math.min(Math.max(index, 0), Math.max(visibleOrder.length - 1, 0));
  const currentCard = completed ? null : cardsById[visibleOrder[safeIndex]] ?? null;

  const stats = useMemo(() => {
    let understood = 0;
    let notUnderstood = 0;
    for (const id of cardIds) {
      if (status[id] === 'understood') understood++;
      else if (status[id] === 'not_understood') notUnderstood++;
    }
    return {
      understood,
      notUnderstood,
      pending: cardIds.length - understood - notUnderstood,
      total: cardIds.length
    };
  }, [cardIds, status]);

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, visibleOrder.length));
  }, [visibleOrder.length, setIndex]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, [setIndex]);

  const markUnderstood = useCallback(() => {
    if (!currentCard) return;
    const cardId = currentCard.id;
    setStatus((s) => ({ ...s, [cardId]: 'understood' }));
    if (filter === 'all') {
      setIndex((i) => i + 1);
    }
  }, [currentCard, filter, setStatus, setIndex]);

  const markNotUnderstood = useCallback(() => {
    if (!currentCard) return;
    const cardId = currentCard.id;
    setStatus((s) => ({ ...s, [cardId]: 'not_understood' }));
    setSavedOrder((ord) => {
      const without = ord.filter((id) => id !== cardId);
      return [...without, cardId];
    });
  }, [currentCard, setStatus, setSavedOrder]);

  const shuffleDeck = useCallback(() => {
    setSavedOrder(shuffleArray(cardIds));
    setIndex(0);
  }, [cardIds, setSavedOrder, setIndex]);

  const resetProgress = useCallback(() => {
    setStatus({});
    setSavedOrder(cardIds);
    setIndex(0);
    setFilterRaw('all');
  }, [cardIds, setStatus, setSavedOrder, setIndex, setFilterRaw]);

  const setFilter = useCallback(
    (f) => {
      setFilterRaw(f);
      setIndex(0);
    },
    [setFilterRaw, setIndex]
  );

  return {
    currentCard,
    position: safeIndex,
    totalVisible: visibleOrder.length,
    totalAll: cardIds.length,
    completed,
    filter,
    setFilter,
    next,
    prev,
    markUnderstood,
    markNotUnderstood,
    shuffle: shuffleDeck,
    resetProgress,
    stats
  };
}
