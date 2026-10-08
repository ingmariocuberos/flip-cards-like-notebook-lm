import { NavLink } from 'react-router-dom';

export default function LibraryTabs() {
  return (
    <nav className="library-tabs" aria-label="Bibliotecas">
      <NavLink
        end
        to="/"
        className={({ isActive }) => `library-tab${isActive ? ' active' : ''}`}
      >
        Tarjetas didácticas
      </NavLink>
      <NavLink
        to="/resources"
        className={({ isActive }) => `library-tab${isActive ? ' active' : ''}`}
      >
        Audio/Visual Resources
      </NavLink>
    </nav>
  );
}
