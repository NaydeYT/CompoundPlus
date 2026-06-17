import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { loadParams, simulate, futureValue, fmtEUR, fmtEURk } from "../lib/calc.js";
import { useReveal, useTitle, useInView, CountUp } from "../lib/anim.jsx";

const fmtPctFr = (x, d = 1) => x.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }) + "%";

/* ============================================================
   Graphique : Évolution de l'épargne (aire verte vs dépôt seul)
   ============================================================ */
function EvolutionChart({ result, params }) {
  const W = 760, H = 270;
  const M = { top: 16, right: 12, bottom: 28, left: 48 };
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const s = result.series;
  const maxVal = Math.max(result.gross, result.invested) * 1.08;
  const x = (yr) => M.left + (yr / params.years) * plotW;
  const y = (v) => M.top + plotH - (v / maxVal) * plotH;

  const lineD = s.map((p, i) => (i === 0 ? "M" : "L") + x(p.year) + " " + y(p.capital)).join(" ");
  const dashD = s.map((p, i) => (i === 0 ? "M" : "L") + x(p.year) + " " + y(p.invested)).join(" ");
  const areaD = lineD + ` L ${x(params.years)} ${y(0)} L ${x(0)} ${y(0)} Z`;

  /* grille + étiquettes Y (4 niveaux) */
  const grid = [];
  for (let i = 1; i <= 4; i++) {
    const val = (maxVal / 4) * i;
    grid.push(
      <g key={i}>
        <line x1={M.left} x2={W - M.right} y1={y(val)} y2={y(val)} stroke="rgba(198,198,205,0.25)" />
        <text x={M.left - 8} y={y(val) + 4} textAnchor="end" className="axis-label">{Math.round(val / 1000) + "k"}</text>
      </g>
    );
  }

  /* étiquettes X : Auj. → horizon */
  const ticks = Math.min(4, params.years);
  const xLabels = [];
  for (let i = 0; i <= ticks; i++) {
    const yr = Math.round((params.years / ticks) * i);
    xLabels.push(
      <text key={i} x={x(yr)} y={H - 8} textAnchor={i === 0 ? "start" : i === ticks ? "end" : "middle"} className="axis-label">
        {yr === 0 ? "Auj." : yr + " ans"}
      </text>
    );
  }

  /* animation de tracé au scroll */
  const lineRef = useRef(null);
  const [svgRef, inView] = useInView(0.3);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const p = lineRef.current;
    p.style.setProperty("--len", p.getTotalLength());
    const raf = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <svg id="evolutionChart" ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Évolution de l'épargne comparée">
      {grid}
      <line x1={M.left} x2={W - M.right} y1={y(0)} y2={y(0)} stroke="rgba(198,198,205,0.5)" />
      {xLabels}
      <defs>
        <linearGradient id="evoArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6cf8bb" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#6cf8bb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#evoArea)" className={"area-fade" + (drawn ? " drawn" : "")} />
      <path d={dashD} fill="none" stroke="#b9cdf3" strokeWidth="2.5" strokeDasharray="6 6" />
      <path ref={lineRef} d={lineD} fill="none" stroke="#006c49" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={"line-draw" + (drawn ? " drawn" : "")} />
    </svg>
  );
}

/* ============================================================
   Graphique : Comparaison des placements (barres animées)
   ============================================================ */
function CompareChart({ compareData }) {
  const W = 924, H = 320;
  const M = { top: 40, right: 16, bottom: 38, left: 56 };
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const maxVal = Math.max(...compareData.map((d) => d.value)) * 1.15;
  const y = (v) => M.top + plotH - (v / maxVal) * plotH;

  const [svgRef, drawn] = useInView(0.3);

  /* grille + étiquettes Y */
  const steps = 4;
  const grid = [];
  for (let i = 0; i <= steps; i++) {
    const val = (maxVal / steps) * i;
    grid.push(
      <g key={i}>
        <line x1={M.left} x2={W - M.right} y1={y(val)} y2={y(val)} stroke={i === 0 ? "#cad5e2" : "#f1f5f9"} />
        <text x={M.left - 10} y={y(val) + 4} textAnchor="end" className="axis-label">{Math.round(val / 1000) + "k €"}</text>
      </g>
    );
  }

  const n = compareData.length;
  const slot = plotW / n;
  const barW = Math.min(120, slot * 0.5);

  return (
    <svg id="compareChart" ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Comparaison des placements">
      {grid}
      {compareData.map((d, i) => {
        const cx = M.left + slot * i + slot / 2;
        const h = Math.max(2, (d.value / maxVal) * plotH);
        return (
          <g key={d.label}>
            <rect
              x={cx - barW / 2} y={y(0) - h} width={barW} height={h} rx="4" fill={d.color}
              className={"compare-bar" + (drawn ? " drawn" : "")}
              style={{ transitionDelay: (i * 0.12) + "s" }}
            />
            <text
              x={cx} y={y(0) - h - 10} textAnchor="middle" fill="#0f172a" fontSize="13"
              className={"compare-value" + (drawn ? " drawn" : "")}
              style={{ transitionDelay: (0.5 + i * 0.12) + "s" }}
            >
              {fmtEURk(d.value)}
            </text>
            <text x={cx} y={H - 12} textAnchor="middle" fill="#475569" fontSize="12" fontFamily="Inter, sans-serif">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ============================================================
   Page
   ============================================================ */
export default function Resultats() {
  useTitle("Projection Financière — Compound+");
  useReveal();

  const [params] = useState(loadParams);
  const result = useMemo(() => simulate(params), [params]);
  const plural = params.years > 1 ? "ans" : "an";

  const interestPct = Math.round(result.interestShare * 100);
  const investedPct = 100 - interestPct;

  /* barre de progression animée à l'apparition */
  const [barRef, barInView] = useInView(0.4);

  const compareData = useMemo(() => [
    { label: "Compte Courant", rate: 0, color: "#cbd5e1" },
    { label: "Fonds euros*", rate: 1.9, color: "#cbd5e1" },
    { label: "ETF MSCI World**", rate: 8.2, color: "#cbd5e1" },
    { label: "Placement de référence", rate: result.netRate, color: "#00a63e" }
  ].map((c) => ({
    ...c,
    value: futureValue(params.initial, params.monthly, c.rate, params.years)
  })), [params, result.netRate]);

  /* interprétation dynamique */
  const [cc, fe, etf, refP] = compareData;
  const ratioCC = cc.value > 0 ? refP.value / cc.value : 0;
  const vsFE = fe.value > 0 ? ((refP.value - fe.value) / fe.value) * 100 : 0;
  const diffETF = refP.value - etf.value;

  return (
    <>
      <Navbar />

      <main className="page-main container">
        <header className="page-header">
          <div>
            <h1 className="reveal">Projection Financière</h1>
            <p className="lede reveal" style={{ "--reveal-delay": ".08s" }}>Voici l'analyse détaillée de votre potentiel de rendement basé sur vos objectifs à long terme.</p>
          </div>
          <Link to="/simulateur" className="btn btn-blue reveal" style={{ "--reveal-delay": ".15s" }}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" />
              <line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" />
              <line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" />
              <line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" />
            </svg>
            Modifier mes paramètres
          </Link>
        </header>

        {/* ====================== Bento ====================== */}
        <div className="bento">
          {/* Carte héro */}
          <article className="card bento-hero reveal">
            <p className="scenario-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
              </svg>
              Scénario de Référence
            </p>
            <h2>Capital Final Estimé</h2>
            <p className="final-amount" id="finalAmount"><CountUp value={result.gross} format={fmtEUR} duration={1400} /></p>
            <div className="synthese" id="syntheseBox">
              <strong>Synthèse :</strong> Sur {params.years} {plural}, votre capital pourrait atteindre{" "}
              <strong>{fmtEUR(result.gross)}</strong> en maintenant un effort d'épargne régulier.{" "}
              Cette projection se base sur un rendement annuel moyen de {fmtPctFr(result.netRate)},{" "}
              capitalisant sur les intérêts composés pour maximiser votre croissance à long terme.
            </div>
          </article>

          {/* Effet du temps */}
          <article className="card insight-card reveal" style={{ "--reveal-delay": ".1s" }}>
            <div className="insight-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 22h14" /><path d="M5 2h14" />
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
              </svg>
            </div>
            <h3>Effet du temps</h3>
            <p>
              La durée de votre investissement est votre meilleur allié. Sur la période visée,{" "}
              {interestPct >= 50 ? "plus de" : "près de"} <strong>{interestPct}%</strong> de votre capital final sera constitué{" "}
              uniquement d'intérêts générés par vos précédents rendements.
            </p>
            <div className="progress-track">
              <div ref={barRef} className="progress-fill" id="interestBar" style={{ width: barInView ? interestPct + "%" : "0%" }}></div>
            </div>
            <div className="progress-labels">
              <span className="l">Capital versé ({investedPct}%)</span>
              <span className="r">Intérêts ({interestPct}%)</span>
            </div>
          </article>

          {/* Évolution de l'épargne */}
          <article className="card bento-chart reveal" style={{ "--reveal-delay": ".05s" }}>
            <div className="bento-chart-head">
              <h3>Évolution de l'épargne</h3>
              <div className="mini-legend">
                <span><i className="dot" style={{ background: "#006c49" }}></i>Placement de référence</span>
                <span><i className="dot" style={{ background: "#d3e4fe" }}></i>Sans investir</span>
              </div>
            </div>
            <div className="chart-wrap">
              <EvolutionChart result={result} params={params} />
            </div>
          </article>

          {/* Effet de l'épargne mensuelle */}
          <article className="card insight-card reveal" style={{ "--reveal-delay": ".15s" }}>
            <div className="insight-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
                <path d="M2 9v1c0 1.1.9 2 2 2h1" /><path d="M16 11h.01" />
              </svg>
            </div>
            <h3>Effet de l'épargne mensuelle</h3>
            <p>
              {params.monthly > 0 ? (
                <>Votre versement régulier de <strong>{fmtEUR(params.monthly)}/mois</strong> crée un socle solide.{" "}
                  Il permet de lisser votre investissement dans le temps, d'accélérer la croissance de votre capital{" "}
                  et de renforcer progressivement l'effet des intérêts composés.</>
              ) : (
                <>Sans versement mensuel, votre projection repose uniquement sur votre capital initial.{" "}
                  Ajouter un versement régulier, même modeste, accélérerait nettement la croissance de votre capital{" "}
                  grâce aux intérêts composés.</>
              )}
            </p>
          </article>
        </div>

        {/* ====================== Comparaison ====================== */}
        <section className="compare-section reveal">
          <div className="compare-card">
            <h2>Comparaison des placements</h2>
            <p className="compare-sub" id="compareSub">Projection du capital net après {params.years} {plural} selon le type de support.</p>
            <div className="compare-chart-wrap">
              <CompareChart compareData={compareData} />
            </div>
            <p className="compare-notes">
              * Sur la base du taux annuel moyen de ces 10 dernières années soit 1,9%<br />
              ** Sur la base du rendement moyen annuel de ces 20 dernières années soit 8,2%
              <span className="disclaimer">Les performances passées ne préjugent pas des performances futures.</span>
            </p>
            <div className="interpretation">
              <h3>Interprétation des résultats</h3>
              <p id="interpretationText">
                Sur un horizon de {params.years} {plural}, le <span className="hl-green">placement de référence</span> atteint{" "}
                <span className="hl-green">{fmtEURk(refP.value)}</span>, soit près de{" "}
                <span className="hl-dark">{ratioCC.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} fois</span> le capital obtenu{" "}
                sur un compte courant ({fmtEURk(cc.value)}) et environ{" "}
                <span className="hl-dark">{(vsFE >= 0 ? "+" : "") + Math.round(vsFE)}%</span> par rapport à un fonds euros classique ({fmtEURk(fe.value)}).{" "}
                {diffETF >= 0 ? (
                  <>Comparé à un ETF MSCI World ({fmtEURk(etf.value)}), il génère <span className="hl-dark">+{fmtEURk(diffETF)}</span> supplémentaires,{" "}
                    illustrant l'effet combiné d'une allocation diversifiée et de la capitalisation des intérêts composés sur le long terme.{" "}</>
                ) : (
                  <>Un ETF MSCI World ({fmtEURk(etf.value)}) ferait toutefois mieux de <span className="hl-dark">{fmtEURk(Math.abs(diffETF))}</span> sur la base{" "}
                    de son rendement historique, au prix d'une volatilité nettement supérieure.{" "}</>
                )}
                Cette projection reste indicative : elle dépend de la régularité des versements, de la stabilité des rendements et de la durée effective d'investissement.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
