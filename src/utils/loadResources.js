const modules = import.meta.glob('../resources/*.json', { eager: true });

const resourcesByBook = new Map();

for (const mod of Object.values(modules)) {
  const resource = mod.default ?? mod;
  const sektionen = Array.isArray(resource.sektionen) ? resource.sektionen : [];
  resourcesByBook.set(resource.bookId, sektionen);
}

const books = Array.from({ length: 47 }, (_, index) => {
  const number = index + 4;
  const bookId = `willkommen-vaughan-${number}`;
  return {
    bookId,
    bookTitle: `Buch ${number}`,
    sektionen: resourcesByBook.get(bookId) ?? []
  };
});

export function getResourceBooks() {
  return books;
}

export function getResourceBook(bookId) {
  return books.find((book) => book.bookId === bookId) ?? null;
}

export function getResourceSektion(bookId, sektionId) {
  const book = getResourceBook(bookId);
  if (!book) return null;
  const sektion = book.sektionen.find((item) => item.sektionId === sektionId);
  return sektion ? { book, sektion } : null;
}
