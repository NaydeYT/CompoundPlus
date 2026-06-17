import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useTitle } from "../lib/anim.jsx";

export default function Erreur() {
  useTitle("Connexion interrompue — Compound+");

  return (
    <>
      <Navbar />

      <main className="error-page-main">
        <div className="error-card">
          <div className="error-illustration">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h.01" />
              <path d="M8.5 16.429a5 5 0 0 1 7 0" />
              <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
              <path d="M19 12.859a10 10 0 0 0-2.007-1.523" />
              <path d="M2 8.82a15 15 0 0 1 4.177-2.643" />
              <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
              <path d="m2 2 20 20" />
            </svg>
          </div>

          <h2>Connexion interrompue</h2>
          <p className="error-text">Impossible de charger votre simulation pour le moment. Vérifiez votre connexion internet, puis réessayez.</p>

          <div className="error-actions">
            <Link to="/chargement" className="btn btn-block btn-dark">
              <svg className="icon icon-spin-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Réessayer
            </Link>
            <Link to="/simulateur" className="btn btn-block btn-outline">Retour au simulateur</Link>
          </div>

          <p className="error-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            </svg>
            Vos paramètres peuvent être renseignés à nouveau sans création de compte.
          </p>
        </div>
      </main>
    </>
  );
}
