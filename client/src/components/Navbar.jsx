import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./Themetoggle";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <header className="navbar">
      <div className="navbar-container">

        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">🎓</span>
          <span className="logo-text">StageFlow</span>
        </Link>

        <div
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span><span></span><span></span>
        </div>

        <nav className={`nav-menu ${menuOpen ? "show" : ""}`}>
          <Link to="/"        className={isActive("/")}        onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link to="/offers"  className={isActive("/offers")}  onClick={() => setMenuOpen(false)}>Offres</Link>
          <Link to="/about"   className={isActive("/about")}   onClick={() => setMenuOpen(false)}>À propos</Link>
          <Link to="/contact" className={isActive("/contact")} onClick={() => setMenuOpen(false)}>Contact</Link>

          {user && (
            <>
              <Link to="/dashboard" className={isActive("/dashboard")} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/profile"   className={isActive("/profile")}   onClick={() => setMenuOpen(false)}>Profil</Link>
            </>
          )}

          {user?.role === "entreprise" && (
            <Link to="/add-offer" className={isActive("/add-offer")} onClick={() => setMenuOpen(false)}>
              Publier une offre
            </Link>
          )}

          {/* ─── ThemeToggle — composant indépendant importé ─── */}
          <ThemeToggle />

          {user ? (
            <div className="navbar-user">
              <div className="navbar-avatar" title={user.name || user.email}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login"    className="login-link"   onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link to="/register" className="register-btn" onClick={() => setMenuOpen(false)}>Inscription</Link>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
}

export default Navbar;