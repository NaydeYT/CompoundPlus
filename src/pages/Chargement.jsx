import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTitle } from "../lib/anim.jsx";

export default function Chargement() {
  useTitle("Préparation de votre simulation — Compound+");
  const navigate = useNavigate();
  const ringRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("loading-page");
    return () => document.body.classList.remove("loading-page");
  }, []);

  useEffect(() => {
    /* Pas de connexion : la simulation ne peut pas être "chargée" → page erreur */
    if (!navigator.onLine) {
      navigate("/erreur", { replace: true });
      return;
    }

    const ringFg = ringRef.current;
    const barFill = barRef.current;
    const CIRC = 2 * Math.PI * 44;
    ringFg.style.strokeDasharray = CIRC;
    ringFg.style.strokeDashoffset = CIRC;

    const DURATION = 2200; /* ms — assez long pour être lisible, assez court pour rester agréable */
    const start = performance.now();
    let raf = 0, timeout = 0;

    function frame(now) {
      const t = Math.min(1, (now - start) / DURATION);
      /* smoothstep : remplissage régulier (départ et fin adoucis), sans à-coup ni plateau */
      const pct = t * t * (3 - 2 * t);
      ringFg.style.strokeDashoffset = CIRC * (1 - pct);
      barFill.style.width = (pct * 100) + "%";
      if (t < 1) raf = requestAnimationFrame(frame);
      else timeout = setTimeout(() => navigate("/resultats", { replace: true }), 250);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [navigate]);

  return (
    <main className="loading-main">
      <div className="loading-ring-wrap">
        <svg className="ring" viewBox="0 0 96 96" aria-hidden="true">
          <circle className="ring-bg" cx="48" cy="48" r="44" />
          <circle className="ring-fg" ref={ringRef} cx="48" cy="48" r="44" />
        </svg>
        <div className="loading-ring-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <path d="M8 17v-3" />
            <path d="M13 17V9" />
            <path d="M18 17V5" />
          </svg>
        </div>
      </div>

      <h1>Préparation de votre<br />simulation</h1>
      <p className="loading-sub">Nous calculons l'évolution de votre capital et l'impact des intérêts composés.</p>

      <div className="loading-bar-wrap">
        <div className="loading-bar"><div className="loading-bar-fill" ref={barRef}></div></div>
        <p className="loading-hint">Quelques secondes suffisent.</p>
      </div>
    </main>
  );
}
