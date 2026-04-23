import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./Themetoggle";
import {
  FaHome, FaBriefcase, FaInfoCircle, FaEnvelope,
  FaTachometerAlt, FaUser, FaPlusCircle,
  FaSignOutAlt, FaQuestionCircle, FaChevronRight,
} from "react-icons/fa";

const NAV_TOP = [
  { to: "/",        label: "Accueil",  Icon: FaHome },
  { to: "/offers",  label: "Offres",   Icon: FaBriefcase },
  { to: "/about",   label: "À propos", Icon: FaInfoCircle },
  { to: "/contact", label: "Contact",  Icon: FaEnvelope },
];
const NAV_USER = [
  { to: "/dashboard", label: "Dashboard", Icon: FaTachometerAlt },
  { to: "/profile",   label: "Profil",    Icon: FaUser },
];


// El composant Item mta3ek lezem ykoun hakka:
// eslint-disable-next-line no-unused-vars
function Item({ to, label, Icon, active, open, delay = 0 }) {
  return (
    
    <Link
      to={to}
      title={!open ? label : ""}
      style={{ animationDelay: `${delay}ms` }}
      className={`sb-item ${active ? "sb-active" : ""}`}
    >
      {/* 1. El bar el مضيئة elli tji 3al imin walla 3al isar ki ykoun el item active */}
      {active && <span className="sb-bar" />}

      {/* 2. El box mte3 el icon */}
      <span className={`sb-ico ${active ? "sb-ico-on" : ""}`}>
        <Icon />
        {/* 3. El nokta (pulse dot) elli tji fouq el icon active */}
        {active && <span className="sb-dot" />}
      </span>

      {/* 4. El text mte3 el menu */}
      <span className="sb-lbl">{label}</span>

      {/* 5. El tooltip elli yokhroj ki tghalaq el sidebar (collapsed) */}
      {!open && <span className="sb-tip">{label}</span>}
    </Link>
    
  );
}
export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen]   = useState(false);
  const [mob, setMob]     = useState(false);
  const [ready, setReady] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMob(false); }, [location.pathname]);

  const out    = () => { logout(); navigate("/"); };
  const active = (p) => location.pathname === p;

  return (
    <>
      {/* Mobile FAB */}
      <button className="sb-fab" onClick={() => setMob(v => !v)} aria-label="Menu">
        <span className="sb-fab-icon">{mob ? "✕" : "☰"}</span>
      </button>
      

      {/* Overlay */}
      {mob && <div className="sb-veil" onClick={() => setMob(false)} />}

      {/* ══════════ SIDEBAR ══════════ */}
      <aside
        className={[
          "sb-root",
          open  ? "sb-open"  : "",
          mob   ? "sb-mob"   : "",
          ready ? "sb-ready" : "",
        ].filter(Boolean).join(" ")}
      >
        {/* chevron */}
        <button className="sb-chevron" onClick={() => setOpen(v => !v)} aria-label="Toggle">
          <FaChevronRight className="sb-chevron-ico" />
        </button>

        {/* logo */}
        <div className="sb-head">
          <Link to="/" className="sb-logo-icon">🎓</Link>
          <span className="sb-logo-txt">StageFlow</span>
        </div>

        {/* nav */}
        <nav className="sb-nav">
          <span className="sb-cap">Navigation</span>
          {NAV_TOP.map((x, i) => (
            <Item key={x.to} {...x} active={active(x.to)} open={open} delay={i * 40} />
          ))}

          {user && <>
            <div className="sb-line" />
            <span className="sb-cap">Mon espace</span>
            {NAV_USER.map((x, i) => (
              <Item key={x.to} {...x} active={active(x.to)} open={open} delay={i * 40} />
            ))}
            {user.role === "entreprise" && (
              <Item to="/add-offer" label="Publier une offre" Icon={FaPlusCircle}
                active={active("/add-offer")} open={open} />
            )}
          </>}

          {!user && <>
            <div className="sb-line" />
            <Item to="/login"    label="Connexion"   Icon={() => <span className="sb-emoji">🔑</span>} active={false} open={open} />
            <Item to="/register" label="Inscription" Icon={() => <span className="sb-emoji">✨</span>} active={false} open={open} />
          </>}
        </nav>

        {/* bottom */}
        <div className="sb-btm">
          <div className="sb-line" />

          {/* help */}
          <a href="#" className="sb-bot" aria-label="Aide">
            <span className="sb-ico"><FaQuestionCircle /></span>
            <span className="sb-lbl">Aide</span>
            {!open && <span className="sb-tip">Aide</span>}
          </a>

          {/* theme — scaled wrapper */}
          
          <div className="sb-theme-row">
            <span className="sb-theme-slot">
              <ThemeToggle />
            </span>
            <span className="sb-lbl">Thème</span>
          </div>

          {user && <>
            <div className="sb-line" />
            {/* user card */}
            <div className="sb-user">
              <span className="sb-av">{user.name?.charAt(0).toUpperCase()}</span>
              <div className="sb-uinfo">
                <span className="sb-uname">{user.name}</span>
                <span className="sb-urole">{user.role}</span>
              </div>
            </div>
            {/* logout */}
            <button className="sb-bot sb-logout" onClick={out} aria-label="Déconnexion">
              <span className="sb-ico"><FaSignOutAlt /></span>
              <span className="sb-lbl">Déconnexion</span>
              {!open && <span className="sb-tip">Déconnexion</span>}
            </button>
          </>}
        </div>
      </aside>
    </>
  );
}

