import { shuffle } from './shuffle.js';

export const PRACTICE_SIZE = 5;

export function practiceStorageKey(bookId, sektionId) {
  return `flashcards:practice:v1:${bookId}:${sektionId}`;
}

export function getPracticeTurns(turns) {
  return turns.flatMap((turn, index) => {
    const previous = turns[index - 1];
    return index > 0 &&
      typeof previous?.de === 'string' &&
      typeof turn.de === 'string' &&
      typeof turn.es === 'string' &&
      turn.de.trim().split(/\s+/).length >= 4
      ? [index]
      : [];
  });
}

export function readPracticeState(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? {};
  } catch {
    return {};
  }
}

export function reconcilePracticeState(saved, turns) {
  const available = new Set(getPracticeTurns(turns));
  const seen = Array.isArray(saved?.seen)
    ? [...new Set(saved.seen.filter((index) => available.has(index)))]
    : [];
  const savedSession = saved?.session;
  if (!Array.isArray(savedSession?.indices)) return { seen, session: null };

  const indices = [...new Set(savedSession.indices.filter((index) => available.has(index)))];
  if (indices.length === 0) return { seen, session: null };

  const position = Number.isInteger(savedSession.position)
    ? Math.max(0, Math.min(savedSession.position, indices.length))
    : 0;
  const phase = ['prompt', 'hint', 'answer'].includes(savedSession.phase)
    ? savedSession.phase
    : 'prompt';
  const sceneRevealed = savedSession.sceneRevealed === true;
  const ratings = {};
  for (const index of indices) {
    const rating = savedSession.ratings?.[index];
    if (['independent', 'hint', 'retry'].includes(rating)) ratings[index] = rating;
  }

  return { seen, session: { indices, position, phase, sceneRevealed, ratings } };
}

export function startPractice(state, turns) {
  const available = getPracticeTurns(turns);
  if (available.length === 0) return { seen: [], session: null };

  const limit = Math.min(PRACTICE_SIZE, available.length);
  const seen = new Set(state.seen);
  const selected = shuffle(available.filter((index) => !seen.has(index))).slice(0, limit);

  if (selected.length < limit) {
    const selectedSet = new Set(selected);
    selected.push(...shuffle(available.filter((index) => !selectedSet.has(index))).slice(0, limit - selected.length));
    return {
      seen: selected,
      session: { indices: selected.sort((a, b) => a - b), position: 0, phase: 'prompt', sceneRevealed: false, ratings: {} }
    };
  }

  return {
    seen: [...seen, ...selected],
    session: { indices: selected.sort((a, b) => a - b), position: 0, phase: 'prompt', sceneRevealed: false, ratings: {} }
  };
}

export function getPracticeHint(text) {
  const words = text.trim().split(/\s+/);
  return `${words.slice(0, Math.min(3, words.length - 1)).join(' ')}…`;
}

export function repeatDifficultTurns(state) {
  const indices = state.session.indices.filter(
    (index) => state.session.ratings[index] !== 'independent'
  );
  if (indices.length === 0) return state;

  return {
    ...state,
    session: { indices, position: 0, phase: 'prompt', sceneRevealed: false, ratings: {} }
  };
}
