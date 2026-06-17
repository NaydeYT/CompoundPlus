import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useReveal, useTitle } from "../lib/anim.jsx";
import { DEFAULTS, simulate, fmtEUR } from "../lib/calc.js";

/* aperçu produit : valeurs du scénario par défaut du simulateur (cohérentes, non inventées) */
const DEMO = simulate(DEFAULTS);
const DEMO_SHARE = Math.round(DEMO.interestShare * 100);
const DONUT_CIRC = 2 * Math.PI * 17; /* doit correspondre au r du cercle SVG */
const DONUT_OFFSET = (DONUT_CIRC * (1 - DEMO.interestShare)).toFixed(1);

/* positions déterministes des étoiles du fond et des particules ascendantes */
const STARS = [
  { x: "6%", y: "22%", d: "0s" }, { x: "13%", y: "64%", d: "-1.2s" }, { x: "21%", y: "12%", d: "-2.4s" },
  { x: "28%", y: "82%", d: "-0.8s" }, { x: "37%", y: "30%", d: "-3.1s" }, { x: "44%", y: "70%", d: "-1.9s" },
  { x: "52%", y: "16%", d: "-2.7s" }, { x: "60%", y: "54%", d: "-0.4s" }, { x: "66%", y: "86%", d: "-3.6s" },
  { x: "73%", y: "24%", d: "-1.5s" }, { x: "80%", y: "62%", d: "-2.1s" }, { x: "87%", y: "38%", d: "-0.9s" },
  { x: "92%", y: "74%", d: "-3.3s" }, { x: "96%", y: "14%", d: "-1.7s" }
];
const PARTICLES = [
  { left: "6%", s: 3, dur: "7s", d: "0s" }, { left: "18%", s: 4, dur: "9s", d: "-2s" },
  { left: "30%", s: 3, dur: "6.5s", d: "-4s" }, { left: "42%", s: 5, dur: "10s", d: "-1s" },
  { left: "55%", s: 3, dur: "7.5s", d: "-5s" }, { left: "67%", s: 4, dur: "8.5s", d: "-3s" },
  { left: "78%", s: 3, dur: "6s", d: "-2.5s" }, { left: "88%", s: 5, dur: "9.5s", d: "-6s" },
  { left: "96%", s: 3, dur: "7s", d: "-4.5s" }
];

export default function Landing() {
  useTitle("Compound+ — Simulez le rendement de vos investissements");
  useReveal();

  /* inclinaison 3D de la scène suivant la souris (désactivée si reduced-motion) */
  const tiltRef = useRef(null);
  const reduceMotion = useRef(false);
  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function onHeroMove(e) {
    if (reduceMotion.current) return;
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const clamp = (v) => Math.max(-0.9, Math.min(0.9, v));
    const dx = clamp((e.clientX - (r.left + r.width / 2)) / r.width);
    const dy = clamp((e.clientY - (r.top + r.height / 2)) / r.height);
    el.style.transform = `rotateY(${dx * 10}deg) rotateX(${-dy * 10}deg)`;
  }
  function onHeroLeave() {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  }

  const scrollToSteps = () => document.querySelector(".steps-section")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <Navbar heroOverlay />

      <main>
        {/* ====================== Hero ====================== */}
        <section className="hero-section" onMouseMove={onHeroMove} onMouseLeave={onHeroLeave}>
          <div className="hero-halo halo-1"></div>
          <div className="hero-halo halo-2"></div>
          <div className="hero-halo halo-3"></div>

          <div className="hero-stars" aria-hidden="true">
            {STARS.map((s, i) => (
              <i key={i} style={{ left: s.x, top: s.y, animationDelay: s.d }} />
            ))}
          </div>

          <div className="hero">
            <div className="hero-text">
              <h1 className="reveal">Simulez le <span className="hl-accent">rendement</span><br />de vos investissements<br />en quelques secondes</h1>
              <p className="hero-sub reveal" style={{ "--reveal-delay": ".1s" }}>évaluez la pertinence de votre stratégie d’épargne gratuitement et sans création de compte dès maintenant</p>

              <div className="hero-stats reveal" style={{ "--reveal-delay": ".18s" }}>
                <div className="hero-stat">
                  <span className="hero-stat-num">&lt; 30 s</span>
                  <span className="hero-stat-label">pour votre<br />première projection</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">40 ans</span>
                  <span className="hero-stat-label">d'horizon simulable,<br />inflation &amp; frais inclus</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num green">0 €</span>
                  <span className="hero-stat-label">de frais,<br />sans compte</span>
                </div>
              </div>

              <Link to="/simulateur" className="btn btn-pill btn-accent reveal" style={{ "--reveal-delay": ".26s" }}>
                <svg className="icon icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                Lancer une simulation
              </Link>
            </div>

            <div className="hero-visual">
              <div className="hero-tilt" ref={tiltRef}>
                <div className="hero-particles" aria-hidden="true">
                  {PARTICLES.map((p, i) => (
                    <i key={i} style={{ left: p.left, width: p.s + "px", height: p.s + "px", animationDuration: p.dur, animationDelay: p.d }} />
                  ))}
                </div>

                <div className="product-glow" aria-hidden="true"></div>

                {/* aperçu produit : mini-dashboard du simulateur */}
                <div className="product-card" aria-hidden="true">
                  <div className="pc-head">
                    <span className="pc-title">Projection du capital</span>
                    <span className="pc-live"><i></i>En direct</span>
                  </div>
                  <div className="pc-amount">{fmtEUR(DEMO.gross)}</div>
                  <div className="pc-pill">
                    <svg viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 9 7 3l3 3 3-5" /></svg>
                    + {fmtEUR(DEMO.interestsGross)} d'intérêts
                  </div>
                  <svg className="pc-chart" viewBox="0 0 336 130" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="pcArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6cf8bb" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#6cf8bb" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M6 116 C 70 108, 104 90, 150 76 S 252 40, 330 12 L 330 130 L 6 130 Z" fill="url(#pcArea)" />
                    <path className="pc-line" d="M6 116 C 70 108, 104 90, 150 76 S 252 40, 330 12" />
                    <circle className="pc-dot" cx="330" cy="12" r="5" />
                  </svg>
                  <div className="pc-axis"><span>Auj.</span><span>5 ans</span><span>10 ans</span><span>15 ans</span></div>
                </div>

                {/* badges flottants */}
                <div className="float-chip chip-donut" aria-hidden="true">
                  <svg className="fc-ring" viewBox="0 0 40 40">
                    <circle className="fc-ring-bg" cx="20" cy="20" r="17" />
                    <circle className="fc-ring-fg" cx="20" cy="20" r="17" transform="rotate(-90 20 20)" style={{ "--donut-off": DONUT_OFFSET }} />
                  </svg>
                  <span className="fc-text">
                    <span className="fc-num">{DEMO_SHARE} %</span>
                    <span className="fc-label">d'intérêts</span>
                  </span>
                </div>

                <div className="float-chip chip-coin" aria-hidden="true">€</div>
              </div>
            </div>
          </div>

          <button className="hero-scroll-cue" onClick={scrollToSteps} aria-label="Découvrir comment ça marche">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </section>

        {/* ====================== Comment ça marche ====================== */}
        <section className="steps-section">
          <div className="steps-halo"></div>
          <div className="steps-head reveal">
            <h2>Comment ça marche ?</h2>
            <p>Une approche logique et transparente pour projeter la progression de votre épargne</p>
          </div>
          <div className="steps-grid">
            <article className="step-card reveal">
              <div className="step-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                </svg>
              </div>
              <h3>1. Capital Initial</h3>
              <p>Définissez le montant que vous avez déjà mis de côté. C'est le point de départ de votre projection à long terme.</p>
            </article>
            <article className="step-card reveal" style={{ "--reveal-delay": ".12s" }}>
              <div className="step-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <h3>2. Effort d'Épargne</h3>
              <p>Ajoutez vos versements mensuels prévus. Notre moteur calcule l'impact de la régularité sur vos intérêts composés.</p>
            </article>
            <article className="step-card reveal" style={{ "--reveal-delay": ".24s" }}>
              <div className="step-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
                </svg>
              </div>
              <h3>3. Comparer</h3>
              <p>Visualisez instantanément la différence entre laisser votre argent dormir et l'investir sur des supports dynamiques.</p>
            </article>
          </div>
        </section>

        {/* ====================== CTA ====================== */}
        <section className="container">
          <div className="cta-dark reveal">
            <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h2>100% gratuit, sans compte.</h2>
            <p>Nous croyons en l'accès libre à l'éducation financière. Réalisez autant de simulations que vous le souhaitez, sans jamais avoir à renseigner votre email ou créer un profil.</p>
            <Link to="/simulateur" className="btn btn-pill btn-light">
              Lancer une simulation
              <svg className="icon icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
