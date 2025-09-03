import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ cartItemCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-left">
            <div className="navbar-logo">
              <Link to="/" className="navbar-logo-link">
                TiendaOnline
              </Link>
            </div>
            <div className="navbar-links">
              <Link
                to="/"
                className="navbar-link"
              >
                Inicio
              </Link>
              <div className="dropdown">
                <button
                  type="button"
                  className="dropdown-button"
                >
                  Categorías
                  <svg
                    className="dropdown-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="dropdown-menu">
                  <div role="menu" aria-orientation="vertical">
                    <Link
                      to="/?category=electronics"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Electrónica
                    </Link>
                    <Link
                      to="/?category=clothing"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Ropa
                    </Link>
                    <Link
                      to="/?category=home"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Hogar
                    </Link>
                    <Link
                      to="/?category=beauty"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Belleza
                    </Link>
                  </div>
                </div>
              </div>
              <Link
                to="/cart"
                className="navbar-link"
              >
                Carrito
                {cartItemCount > 0 && (
                  <span className="cart-count">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div className="navbar-right">
            <button
              onClick={toggleTheme}
              className="theme-toggle-button"
              aria-label="Cambiar tema"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                </svg>
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mobile-menu-button"
            >
              <span className="sr-only">Abrir menú principal</span>
              {!isMenuOpen ? (
                <svg
                  className="mobile-menu-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="mobile-menu-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-links">
          <Link
            to="/"
            className="mobile-menu-link"
            onClick={() => setIsMenuOpen(false)}
          >
            Inicio
          </Link>
          <div>
            <button
              className="mobile-menu-link"
              style={{ width: '100%', textAlign: 'left' }}
            >
              Categorías
            </button>
            <div style={{ paddingLeft: '1.5rem' }}>
              <Link
                to="/?category=electronics"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Electrónica
              </Link>
              <Link
                to="/?category=clothing"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Ropa
              </Link>
              <Link
                to="/?category=home"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Hogar
              </Link>
              <Link
                to="/?category=beauty"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Belleza
              </Link>
            </div>
          </div>
          <Link
            to="/cart"
            className="mobile-menu-link"
            onClick={() => setIsMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            Carrito
            {cartItemCount > 0 && (
              <span className="cart-count" style={{ marginLeft: '0.5rem' }}>
                {cartItemCount}
              </span>
            )}
          </Link>
          </div>
        </div>
    </nav>
  );
};

export default Navbar;