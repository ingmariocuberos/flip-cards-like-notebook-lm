import { Routes, Route, Navigate } from 'react-router-dom';
import BookList from './components/BookList.jsx';
import SektionList from './components/SektionList.jsx';
import CardDeck from './components/CardDeck.jsx';
import ResourceBookList from './components/ResourceBookList.jsx';
import ResourceSektionList from './components/ResourceSektionList.jsx';
import Conversation from './components/Conversation.jsx';
import ReviewDeck from './components/ReviewDeck.jsx';
import PracticeConversation from './components/PracticeConversation.jsx';
import TutorAudioPilot from './components/TutorAudioPilot.jsx';
import ProgressTransfer from './components/ProgressTransfer.jsx';
import Pomodoro from './components/Pomodoro.jsx';

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/buch/:bookId" element={<SektionList />} />
        <Route path="/buch/:bookId/sektion/:sektionId" element={<CardDeck />} />
        <Route path="/buch/:bookId/nivel/:sektionId" element={<CardDeck />} />
        <Route path="/review" element={<ReviewDeck />} />
        <Route path="/progreso" element={<ProgressTransfer />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/resources" element={<ResourceBookList />} />
        <Route path="/resources/buch/:bookId" element={<ResourceSektionList />} />
        <Route path="/resources/buch/:bookId/:sektionId/practice" element={<PracticeConversation />} />
        <Route path="/resources/buch/willkommen-vaughan-11/sektion-3/tutor-pilot" element={<TutorAudioPilot />} />
        <Route path="/resources/buch/:bookId/:sektionId" element={<Conversation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
