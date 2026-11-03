export const FLOWS = {
  classic: { label: '25 / 5', focus: 25, rest: 5 },
  deep: { label: '50 / 10', focus: 50, rest: 10 },
};

export const POMODORO_KEY = 'flashcards:pomodoro:v1';

export function initialTimer(flow = 'classic') {
  return { flow, phase: 'focus', block: 1, remainingMs: FLOWS[flow].focus * 60000, deadline: null };
}

export function remainingTime(timer, now) {
  return Math.max(0, timer.deadline === null ? timer.remainingMs : timer.deadline - now);
}

export function advanceTimer(timer, now) {
  if (timer.deadline === null || timer.phase === 'done') return timer;
  let next = timer;
  while (next.deadline !== null && now >= next.deadline) {
    const boundary = next.deadline;
    if (next.phase === 'focus') {
      next = { ...next, phase: 'break', remainingMs: FLOWS[next.flow].rest * 60000, deadline: boundary + FLOWS[next.flow].rest * 60000 };
    } else if (next.block < 4) {
      next = { ...next, phase: 'focus', block: next.block + 1, remainingMs: FLOWS[next.flow].focus * 60000, deadline: boundary + FLOWS[next.flow].focus * 60000 };
    } else {
      next = { ...next, phase: 'done', remainingMs: 0, deadline: null };
    }
  }
  return next;
}

export function formatTime(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
