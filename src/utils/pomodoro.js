export const FLOWS = {
  classic: { label: '25 / 5', steps: [25, 5, 25, 5, 25, 5, 25, 15] },
  deep: { label: '50 / 10', steps: [50, 10, 50, 10] },
};

export const POMODORO_KEY = 'flashcards:pomodoro:v1';

export function initialTimer(flow = 'classic') {
  return { flow, phase: 'focus', step: 0, remainingMs: FLOWS[flow].steps[0] * 60000, deadline: null };
}

export function currentStep(timer) {
  if (typeof timer.step === 'number') return timer.step;
  return Math.min((timer.block - 1) * 2 + (timer.phase === 'break' ? 1 : 0), FLOWS[timer.flow].steps.length - 1);
}

export function remainingTime(timer, now) {
  return Math.max(0, timer.deadline === null ? timer.remainingMs : timer.deadline - now);
}

export function advanceTimer(timer, now) {
  if (timer.deadline === null || timer.phase === 'done') return timer;
  let next = timer;
  while (next.deadline !== null && now >= next.deadline) {
    const boundary = next.deadline;
    const step = currentStep(next) + 1;
    if (step >= FLOWS[next.flow].steps.length) {
      next = { ...next, phase: 'done', remainingMs: 0, deadline: null };
    } else {
      const remainingMs = FLOWS[next.flow].steps[step] * 60000;
      next = { ...next, step, phase: step % 2 === 0 ? 'focus' : 'break', remainingMs, deadline: boundary + remainingMs };
    }
  }
  return next;
}

export function formatTime(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
