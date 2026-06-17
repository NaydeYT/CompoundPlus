import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useReveal, useTitle } from "../lib/anim.jsx";

const LINKEDIN_URL = "https://www.linkedin.com/in/baptiste-detroye/";

export default function APropos() {
  useTitle("À propos — Compound+");
  useReveal();

  return (
    <>
      <Navbar />

      <main className="page-main container">
        <header className="page-header">
          <div>
            <h1 className="reveal">À propos du projet</h1>
            <p className="lede reveal" style={{ "--reveal-delay": ".08s" }}>
              Une exploration du développement web assisté par IA, du côté d'un profil non-technique.
            </p>
          </div>
        </header>

        <article className="card about-card reveal">
          <p className="scenario-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            Projet étudiant
          </p>

          <p className="about-lead">
            Compound+ est un projet étudiant réalisé dans le cadre de mes études de commerce,
            à partir d'une maquette Figma et avec l'assistance de Claude Code. Il explore dans
            quelle mesure le développement assisté par IA («&nbsp;vibe coding&nbsp;») permet à
            un profil non-technique de concevoir et piloter une application web fonctionnelle.
          </p>

          <div className="about-tools">
            <span className="about-tool">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" /><circle cx="17.5" cy="17.5" r="3.5" />
              </svg>
              Figma
            </span>
            <span className="about-tool">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /><path d="M8 12h8M12 8v8" />
              </svg>
              Claude Code
            </span>
            <span className="about-tool">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="2" />
                <ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
              </svg>
              React
            </span>
          </div>

          <p className="about-note">
            Les données sont fictives et entièrement modifiables&nbsp;: cet outil a une vocation
            pédagogique et ne constitue en aucun cas un conseil en investissement.
          </p>

          <a className="btn btn-pill btn-dark about-linkedin" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.51C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.74C24 .78 23.2 0 22.22 0z" />
            </svg>
            Me retrouver sur LinkedIn
            <svg className="icon icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </a>
        </article>
      </main>

      <Footer />
    </>
  );
}
