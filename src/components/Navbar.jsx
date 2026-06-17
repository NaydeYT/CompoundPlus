import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

/* heroOverlay : la navbar reste transparente tant qu'on est au-dessus du hero plein écran */
export default function Navbar({ heroOverlay = false }) {
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  /* referme le menu mobile à chaque changement de route */
  useEffect(() => { setOpen(false); }, [pathname]);

  /* fermeture au clavier (Échap) */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const update = () => {
      const nav = navRef.current;
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 8);
      if (heroOverlay) nav.classList.toggle("on-hero", window.scrollY < window.innerHeight - 96);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [heroOverlay]);

  return (
    <header className={"navbar" + (heroOverlay ? " on-hero" : "") + (open ? " menu-open" : "")} ref={navRef}>
      <div className="navbar-inner">
        <Link className="brand" to="/">
          <svg className="brand-icon" viewBox="0 0 26 26" aria-hidden="true">
            <rect width="26" height="26" rx="6" fill="#0f172a" />
            <rect x="5" y="14" width="3.5" height="7" rx="1" fill="#fff" />
            <rect x="11" y="10" width="3.5" height="11" rx="1" fill="#fff" />
            <rect x="17" y="5" width="3.5" height="16" rx="1" fill="#6cf8bb" />
          </svg>
          <span className="brand-name">Compound+</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
        </button>

        <nav id="primary-nav" className={"nav-links" + (open ? " open" : "")} onClick={() => setOpen(false)}>
          <NavLink to="/" end className={linkClass}>Accueil</NavLink>
          <NavLink to="/simulateur" className={linkClass}>Simulateur</NavLink>
          <NavLink to="/resultats" className={linkClass}>Comparaison</NavLink>
        </nav>
      </div>
    </header>
  );
}
