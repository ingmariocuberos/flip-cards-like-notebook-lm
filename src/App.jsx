import { Routes, Route, Navigate } from 'react-router-dom';
import BookList from './components/BookList.jsx';
import SektionList from './components/SektionList.jsx';
import CardDeck from './components/CardDeck.jsx';
import ResourceBookList from './components/ResourceBookList.jsx';
import ResourceSektionList from './components/ResourceSektionList.jsx';
import Conversation from './components/Conversation.jsx';

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/buch/:bookId" element={<SektionList />} />
        <Route path="/buch/:bookId/sektion/:sektionId" element={<CardDeck />} />
        <Route path="/resources" element={<ResourceBookList />} />
        <Route path="/resources/buch/:bookId" element={<ResourceSektionList />} />
        <Route path="/resources/buch/:bookId/:sektionId" element={<Conversation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
