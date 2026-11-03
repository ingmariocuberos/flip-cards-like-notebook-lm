import { useEffect, useMemo, useRef, useState } from 'react';
import { getBooks } from '../utils/loadCards.js';
import { readStatus } from '../utils/progress.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { advanceTimer, currentStep, FLOWS, formatTime, initialTimer, POMODORO_KEY, remainingTime } from '../utils/pomodoro.js';
import Card from './Card.jsx';
import LibraryTabs from './LibraryTabs.jsx';

const books = getBooks();

function playChime(context, phase) {
  if (!context) return;
  context.resume().then(() => {
    const start = context.currentTime;
    const notes = phase === 'break' ? [660, 880, 990] : [880, 660];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start + index * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.15, start + index * 0.2 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.2 + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start + index * 0.2);
      oscillator.stop(start + index * 0.2 + 0.2);
    });
  }).catch(() => {});
}

export default function Pomodoro() {
  const [session, setSession] = useLocalStorage(POMODORO_KEY, () => ({
    timer: initialTimer(), selection: { bookId: books[0]?.bookId ?? '', sektionId: books[0]?.sektionen[0]?.sektionId ?? '', ids: [] },
  }));
  const [now, setNow] = useState(Date.now());
  const [showCards, setShowCards] = useState(false);
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusVersion, setStatusVersion] = useState(0);
  const audioRef = useRef(null);
  const practiceRef = useRef(null);
  const lastPhaseRef = useRef(`${session.timer.phase}:${currentStep(session.timer)}`);

  const { timer, selection } = session;
  const book = books.find((item) => item.bookId === selection.bookId) ?? books[0];
  const sektion = book?.sektionen.find((item) => item.sektionId === selection.sektionId) ?? book?.sektionen[0];
  const selectedCards = useMemo(() => sektion?.cards.filter((card) => selection.ids.includes(card.id)) ?? [], [sektion, selection.ids]);
  const status = useMemo(() => sektion ? readStatus(book.bookId, sektion.sektionId) : {}, [book, sektion, statusVersion]);
  const card = selectedCards[position % selectedCards.length];
  const isRunning = timer.deadline !== null;

  useEffect(() => {
    const tick = () => {
      const current = Date.now();
      setNow(current);
      setSession((previous) => {
        const nextTimer = advanceTimer(previous.timer, current);
        return nextTimer === previous.timer ? previous : { ...previous, timer: nextTimer };
      });
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [setSession]);

  useEffect(() => {
    const phaseKey = `${timer.phase}:${currentStep(timer)}`;
    if (phaseKey !== lastPhaseRef.current) {
      lastPhaseRef.current = phaseKey;
      if (soundEnabled) playChime(audioRef.current, timer.phase);
      if (timer.phase === 'break') {
        setShowCards(true);
        window.requestAnimationFrame(() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
      if (timer.phase === 'focus') setShowCards(false);
      document.title = timer.phase === 'break' ? 'Descanso · Tarjetas' : timer.phase === 'done' ? 'Pomodoro terminado' : 'Focus · Tarjetas';
    }
  }, [timer.phase, timer.step, timer.block, soundEnabled]);

  useEffect(() => () => {
    audioRef.current?.close();
    document.title = 'Tarjetas didácticas';
  }, []);

  useEffect(() => { setFlipped(false); }, [card?.id]);

  function updateSelection(nextSelection) {
    setSession((previous) => ({ ...previous, selection: nextSelection }));
    setPosition(0);
    setFlipped(false);
  }

  function chooseBook(bookId) {
    const nextBook = books.find((item) => item.bookId === bookId);
    updateSelection({ bookId, sektionId: nextBook?.sektionen[0]?.sektionId ?? '', ids: [] });
  }

  function chooseSektion(sektionId) {
    updateSelection({ bookId: book.bookId, sektionId, ids: [] });
  }

  function toggleCard(id) {
    updateSelection({ ...selection, ids: selection.ids.includes(id) ? selection.ids.filter((item) => item !== id) : [...selection.ids, id] });
  }

  function chooseCards(kind) {
    const ids = sektion.cards.filter((item) => kind === 'all' || (kind === 'pending' && status[item.id] !== 'understood') || (kind === 'unseen' && !status[item.id])).map((item) => item.id);
    updateSelection({ ...selection, ids });
  }

  function setFlow(flow) {
    setSession((previous) => ({ ...previous, timer: initialTimer(flow) }));
  }

  function startOrPause() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (soundEnabled && AudioContextClass) {
      if (!audioRef.current) audioRef.current = new AudioContextClass();
      audioRef.current.resume().catch(() => {});
    }
    setSession((previous) => ({ ...previous, timer: previous.timer.deadline === null
      ? { ...previous.timer, deadline: Date.now() + previous.timer.remainingMs }
      : { ...previous.timer, remainingMs: remainingTime(previous.timer, Date.now()), deadline: null } }));
  }

  function skip() {
    setSession((previous) => {
      const wasPaused = previous.timer.deadline === null;
      const next = advanceTimer({ ...previous.timer, deadline: Date.now() }, Date.now());
      return { ...previous, timer: wasPaused && next.deadline !== null ? { ...next, deadline: null } : next };
    });
  }

  function mark(value) {
    if (!card) return;
    const key = `flashcards:${book.bookId}:${sektion.sektionId}:status`;
    window.localStorage.setItem(key, JSON.stringify({ ...readStatus(book.bookId, sektion.sektionId), [card.id]: value }));
    setStatusVersion((previous) => previous + 1);
    setFlipped(false);
    setPosition((previous) => previous + 1);
  }

  return (
    <main className="screen pomodoro-screen">
      <header className="screen-header library-header">
        <h1>Tarjetas didácticas</h1>
        <p className="muted">Deutsch · Bücher</p>
        <LibraryTabs />
      </header>

      <div className="pomodoro-layout">
        <section className="pomodoro-timer" aria-label="Temporizador Pomodoro">
          <div className="pomodoro-phase">{timer.phase === 'focus' ? 'FOCUS' : timer.phase === 'break' ? 'BREAK' : 'COMPLETADO'}</div>
          <div className="pomodoro-clock" role="timer">{formatTime(remainingTime(timer, now))}</div>
          <p className="muted">{FLOWS[timer.flow].label} · bloque {Math.min(currentStep(timer) + 1, FLOWS[timer.flow].steps.length)} de {FLOWS[timer.flow].steps.length}</p>
          <div className="pomodoro-controls">
            <button type="button" onClick={() => setSession((previous) => ({ ...previous, timer: initialTimer(previous.timer.flow) }))}>Reset</button>
            <button type="button" onClick={skip} disabled={timer.phase === 'done'}>Saltar</button>
            <button type="button" className="pomodoro-primary" onClick={startOrPause} disabled={timer.phase === 'done' || selectedCards.length === 0}>{isRunning ? 'Pausar' : 'Iniciar'}</button>
          </div>
          <label className="pomodoro-sound"><input type="checkbox" checked={soundEnabled} onChange={(event) => {
            setSoundEnabled(event.target.checked);
            if (event.target.checked) {
              const AudioContextClass = window.AudioContext || window.webkitAudioContext;
              if (AudioContextClass) {
                audioRef.current = new AudioContextClass();
                audioRef.current.resume().catch(() => {});
              }
            }
          }} /> Sonido al cambiar de etapa</label>
        </section>

        <aside className="pomodoro-settings">
          <h2>Flow</h2>
          <div className="pomodoro-flows">
            {Object.entries(FLOWS).map(([id, flow]) => <button key={id} type="button" className={timer.flow === id ? 'active' : ''} onClick={() => setFlow(id)} disabled={isRunning}>{flow.label}</button>)}
          </div>
          <div className="pomodoro-steps" aria-label="Bloques del flow">
            {FLOWS[timer.flow].steps.map((minutes, index) => (
              <div key={index} className={`pomodoro-step ${index % 2 === 0 ? 'focus' : 'rest'} ${index === currentStep(timer) && timer.phase !== 'done' ? 'current' : ''}`}>
                <span>{minutes} min</span><span aria-hidden="true">{index < currentStep(timer) || timer.phase === 'done' ? '✓' : '○'}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="pomodoro-selection">
        <h2>Tarjetas para este flow</h2>
        <div className="pomodoro-selects">
          <label>Libro<select value={book?.bookId ?? ''} onChange={(event) => chooseBook(event.target.value)} disabled={isRunning}>{books.map((item) => <option key={item.bookId} value={item.bookId}>{item.bookTitle}</option>)}</select></label>
          <label>Sektion<select value={sektion?.sektionId ?? ''} onChange={(event) => chooseSektion(event.target.value)} disabled={isRunning}>{book?.sektionen.map((item) => <option key={item.sektionId} value={item.sektionId}>{item.sektionTitle}</option>)}</select></label>
        </div>
        {sektion && <>
          <div className="pomodoro-select-actions">
            <button type="button" onClick={() => chooseCards('pending')} disabled={isRunning}>No entendidas y pendientes</button>
            <button type="button" onClick={() => chooseCards('unseen')} disabled={isRunning}>Solo pendientes</button>
            <button type="button" onClick={() => chooseCards('all')} disabled={isRunning}>Todas</button>
          </div>
          <details className="pomodoro-card-picker">
            <summary>Elegir una por una · {selectedCards.length} seleccionadas</summary>
            <div className="pomodoro-card-options">{sektion.cards.map((item) => <label key={item.id}><input type="checkbox" checked={selection.ids.includes(item.id)} onChange={() => toggleCard(item.id)} disabled={isRunning} /><span>{item.front}</span></label>)}</div>
          </details>
        </>}
        {selectedCards.length === 0 && <p className="muted">Selecciona al menos una tarjeta antes de iniciar.</p>}
      </section>

      {selectedCards.length > 0 && <section className="pomodoro-practice" ref={practiceRef}>
        <div className="pomodoro-practice-heading">
          <div><h2>{timer.phase === 'break' ? 'Tarjetas del descanso' : 'Practicar mientras esperas'}</h2><p className="muted">{position % selectedCards.length + 1} / {selectedCards.length} · {status[card?.id] === 'understood' ? 'Entendida' : status[card?.id] === 'not_understood' ? 'No entendida' : 'Pendiente'}</p></div>
          {timer.phase !== 'break' && <button type="button" onClick={() => setShowCards((shown) => !shown)}>{showCards ? 'Ocultar tarjetas' : 'Abrir tarjetas'}</button>}
        </div>
        {(showCards || timer.phase === 'break') && card && <>
          <Card front={card.front} back={card.back} flipped={flipped} onClick={() => setFlipped((value) => !value)} />
          <div className="pomodoro-card-controls">
            <button type="button" className="warn-btn" onClick={() => mark('not_understood')}>No entendí</button>
            <button type="button" onClick={() => { setFlipped(false); setPosition((value) => value + 1); }}>Siguiente →</button>
            <button type="button" className="ok-btn" onClick={() => mark('understood')}>Entendí</button>
          </div>
        </>}
      </section>}
    </main>
  );
}
