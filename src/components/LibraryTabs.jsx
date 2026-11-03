import { Link, NavLink } from 'react-router-dom';

export default function LibraryTabs() {
  return (
    <>
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
        <NavLink
          to="/pomodoro"
          className={({ isActive }) => `library-tab${isActive ? ' active' : ''}`}
        >
          Pomodoro
        </NavLink>
      </nav>
      <Link className="progress-transfer-link" to="/progreso">Guardar o recuperar progreso →</Link>
    </>
  );
}
