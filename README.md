# Compound+

Simulateur d'intérêts composés — application React générée depuis la maquette Figma « Sovereign Interest ».

Stack : **React 19 + Vite 7 + React Router 7**. Aucune autre dépendance.

## Lancer le site

```powershell
npm install
npm run dev
# → http://localhost:8745/
```

Build de production :

```powershell
npm run build     # génère dist/
npm run preview   # sert le build localement
npm run og        # régénère public/og-image.png depuis le .svg (image de partage)
```

## Déploiement

Le site est une SPA (React Router). Sur un hébergeur statique, **toutes les routes doivent renvoyer `index.html`** sinon un accès direct à `/simulateur` renvoie une 404. Les configs sont déjà fournies :

- **Netlify** : `netlify.toml` + `public/_redirects` (rien à faire)
- **Vercel** : `vercel.json`
- Autre hébergeur : configurer un fallback SPA équivalent vers `/index.html`

⚠️ Après déploiement, remplacer le chemin relatif `og:image` dans `index.html` par l'**URL absolue** du domaine (LinkedIn/Facebook l'exigent pour l'aperçu de partage).

## Pages (routes)

| Route | Rôle |
|---|---|
| `/` | Landing page (hero animé, étapes, CTA) |
| `/simulateur` | Simulateur interactif (curseurs, calculs en direct, graphique avec tooltip) |
| `/chargement` | Écran de transition animé vers l'analyse |
| `/resultats` | Projection financière détaillée (bento, comparaison des placements) |
| `/erreur` | Erreur de connexion |

## Structure

- `src/styles.css` — design tokens Figma + composants + animations (inchangé depuis la version statique)
- `src/lib/calc.js` — moteur d'intérêts composés (capitalisation mensuelle, inflation, frais) + persistance localStorage
- `src/lib/anim.jsx` — hooks d'animation : reveal au scroll (`useReveal`), compteurs animés (`TweenNumber`, `CountUp`), pop de valeur (`PopValue`), détection viewport (`useInView`)
- `src/components/` — `Navbar` (liens actifs via React Router), `Footer`
- `src/pages/` — une page par route, graphiques SVG rendus en JSX

- `scripts/make-og.mjs` — génère l'image de partage `public/og-image.png` (1200×630)

Les paramètres saisis dans le simulateur sont conservés (localStorage, clé `compoundplus.params`) et réutilisés par la page de résultats.
