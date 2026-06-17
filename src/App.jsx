import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Simulateur from "./pages/Simulateur.jsx";
import Chargement from "./pages/Chargement.jsx";
import Resultats from "./pages/Resultats.jsx";
import Erreur from "./pages/Erreur.jsx";
import APropos from "./pages/APropos.jsx";

/* React Router ne remet pas le scroll en haut lors d'un changement de route */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/simulateur" element={<Simulateur />} />
        <Route path="/chargement" element={<Chargement />} />
        <Route path="/resultats" element={<Resultats />} />
        <Route path="/erreur" element={<Erreur />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}
