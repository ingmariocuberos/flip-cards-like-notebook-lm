const REQUIRED = ['bookId', 'bookTitle', 'sektionId', 'sektionTitle', 'cards'];

const modules = import.meta.glob('../data/**/*.json', { eager: true });

function validate(path, json) {
  for (const key of REQUIRED) {
    if (json[key] === undefined) {
      console.warn(`[loadCards] ${path}: missing required field "${key}" — sektion skipped`);
      return false;
    }
  }
  if (!Array.isArray(json.cards)) {
    console.warn(`[loadCards] ${path}: "cards" must be an array — sektion skipped`);
    return false;
  }
  for (const card of json.cards) {
    if (!card.id || card.front === undefined || card.back === undefined) {
      console.warn(`[loadCards] ${path}: each card needs id/front/back`);
      return false;
    }
  }
  return true;
}

function loadAll() {
  const booksById = new Map();

  for (const [path, mod] of Object.entries(modules)) {
    const json = mod.default ?? mod;
    if (!validate(path, json)) continue;

    if (!booksById.has(json.bookId)) {
      booksById.set(json.bookId, {
        bookId: json.bookId,
        bookTitle: json.bookTitle,
        sektionen: []
      });
    }

    const book = booksById.get(json.bookId);
    book.sektionen.push({
      sektionId: json.sektionId,
      sektionTitle: json.sektionTitle,
      order: typeof json.order === 'number' ? json.order : Infinity,
      cards: json.cards
    });
  }

  const books = [...booksById.values()].map((book) => ({
    ...book,
    sektionen: book.sektionen.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.sektionId.localeCompare(b.sektionId);
    })
  }));

  books.sort((a, b) => a.bookTitle.localeCompare(b.bookTitle));
  return books;
}

const books = loadAll();

export function getBooks() {
  return books;
}

export function getBook(bookId) {
  return books.find((b) => b.bookId === bookId) || null;
}

export function getSektion(bookId, sektionId) {
  const book = getBook(bookId);
  if (!book) return null;
  const sektion = book.sektionen.find((s) => s.sektionId === sektionId);
  return sektion ? { book, sektion } : null;
}
