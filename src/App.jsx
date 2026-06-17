import { Routes, Route, Navigate } from 'react-router-dom';
import BookList from './components/BookList.jsx';
import SektionList from './components/SektionList.jsx';
import CardDeck from './components/CardDeck.jsx';

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/buch/:bookId" element={<SektionList />} />
        <Route path="/buch/:bookId/sektion/:sektionId" element={<CardDeck />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
