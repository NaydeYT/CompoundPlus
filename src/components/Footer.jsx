import { Link } from "react-router-dom";

const LINKEDIN_URL = "https://www.linkedin.com/in/baptiste-detroye/";

export default function Footer() {
  return (
    <footer className="footer">
      <nav className="footer-links">
        <Link to="/a-propos">À propos</Link>
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </nav>
      <p className="footer-copy">© Compound+. Simulation indicative. Aucun conseil en investissement. Données modifiables par l'utilisateur. Site gratuit, sans création de compte.</p>
    </footer>
  );
}
