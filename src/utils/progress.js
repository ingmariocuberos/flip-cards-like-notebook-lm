function readStatus(bookId, sektionId) {
  try {
    const raw = window.localStorage.getItem(`flashcards:${bookId}:${sektionId}:status`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSektionStats(bookId, sektion) {
  const status = readStatus(bookId, sektion.sektionId);
  let understood = 0;
  let notUnderstood = 0;
  for (const card of sektion.cards) {
    if (status[card.id] === 'understood') understood++;
    else if (status[card.id] === 'not_understood') notUnderstood++;
  }
  return {
    understood,
    notUnderstood,
    pending: sektion.cards.length - understood - notUnderstood,
    total: sektion.cards.length
  };
}

export function getBookStats(book) {
  const agg = { understood: 0, notUnderstood: 0, pending: 0, total: 0 };
  for (const sektion of book.sektionen) {
    const s = getSektionStats(book.bookId, sektion);
    agg.understood += s.understood;
    agg.notUnderstood += s.notUnderstood;
    agg.pending += s.pending;
    agg.total += s.total;
  }
  return agg;
}
