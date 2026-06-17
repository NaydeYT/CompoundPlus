import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { loadParams, saveParams, simulate, fmtEUR } from "../lib/calc.js";
import { useReveal, useTitle, TweenNumber, PopValue } from "../lib/anim.jsx";

const fmtPctFr = (x) => x.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";

/* ---------- contrôles ---------- */

function Slider({ id, min, max, step, value, disabled = false, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range" id={id} min={min} max={max} step={step} value={value} disabled={disabled}
      onChange={(e) => onChange(+e.target.value)} style={{ "--fill": pct + "%" }}
    />
  );
}

function Switch({ id, checked, onChange, label }) {
  return (
    <label className="switch">
      <input type="checkbox" id={id} checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch-track"></span>
      <span className="switch-knob">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
      </span>
    </label>
  );
}

/* ---------- graphique d'évolution ---------- */

const M = { top: 24, right: 20, bottom: 36, left: 56 };
const W = 700, H = 400;
const plotW = W - M.left - M.right;
const plotH = H - M.top - M.bottom;

function niceCeil(v) {
  if (v <= 0) return 1000;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

const fmtAxis = (v) => v >= 1000000 ? (v / 1000000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + "M €"
  : v >= 1000 ? Math.round(v / 1000) + "k €" : Math.round(v) + " €";

function GrowthChart({ series, years }) {
  const last = series[series.length - 1];
  const maxVal = niceCeil(Math.max(last.capital, last.invested) * 1.05);
  const x = (year) => M.left + (year / years) * plotW;
  const y = (val) => M.top + plotH - (val / maxVal) * plotH;

  const investedD = series.map((p, i) => (i === 0 ? "M" : "L") + x(p.year) + " " + y(p.invested)).join(" ");
  const capitalD = series.map((p, i) => (i === 0 ? "M" : "L") + x(p.year) + " " + y(p.capital)).join(" ");
  const areaD = capitalD + ` L ${x(years)} ${y(0)} L ${x(0)} ${y(0)} Z`;

  /* tracé animé uniquement à l'arrivée sur la page, pas à chaque réglage */
  const [phase, setPhase] = useState("init"); // init → drawing → done
  const investedRef = useRef(null);
  const capitalRef = useRef(null);

  useEffect(() => {
    [investedRef.current, capitalRef.current].forEach((p) => p.style.setProperty("--len", p.getTotalLength()));
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("drawing")));
    const done = setTimeout(() => setPhase("done"), 1800);
    return () => { cancelAnimationFrame(raf); clearTimeout(done); };
  }, []);

  const lineClass = phase === "done" ? undefined : "line-draw" + (phase === "drawing" ? " drawn" : "");
  const areaClass = "area-fade" + (phase === "init" ? "" : " drawn");

  /* grille + axes */
  const gridN = 4;
  const grid = [];
  for (let i = 0; i <= gridN; i++) {
    const val = (maxVal / gridN) * i;
    const gy = y(val);
    grid.push(
      <g key={i}>
        <line x1={M.left} x2={W - M.right} y1={gy} y2={gy} stroke="#e2e8f0" strokeWidth="1" />
        <text x={M.left - 8} y={gy + 4} textAnchor="end" className="axis-label">{fmtAxis(val)}</text>
      </g>
    );
  }
  const ticks = Math.min(5, years);
  const xLabels = [];
  for (let i = 0; i <= ticks; i++) {
    const yr = Math.round((years / ticks) * i);
    xLabels.push(<text key={i} x={x(yr)} y={H - 12} textAnchor="middle" className="axis-label">An {yr}</text>);
  }

  /* tooltip au survol */
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [tip, setTip] = useState(null);
  const [tipShown, setTipShown] = useState(false);
  const points = series.map((d) => ({ px: x(d.year), py: y(d.capital), data: d }));

  function onMove(evt) {
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((evt.clientX - rect.left) / rect.width) * W;
    let nearest = points[0];
    for (const p of points) if (Math.abs(p.px - mx) < Math.abs(nearest.px - mx)) nearest = p;

    const wrapRect = wrapRef.current.getBoundingClientRect();
    const left = (nearest.px / W) * wrapRect.width;
    const top = (nearest.py / H) * wrapRect.height;
    const flip = left > wrapRect.width - 170;
    setTip({
      left: flip ? left - 160 : left + 14,
      top: Math.max(0, top - 70),
      px: nearest.px, py: nearest.py,
      d: nearest.data
    });
    setTipShown(true);
  }

  return (
    <div className="chart-wrap" id="growthChartWrap" ref={wrapRef} onMouseMove={onMove} onMouseLeave={() => setTipShown(false)}>
      <svg id="growthChart" ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Graphique d'évolution du capital">
        {grid}
        {xLabels}
        <defs>
          <linearGradient id="capArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#capArea)" className={areaClass} />
        <path ref={investedRef} d={investedD} fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={lineClass} />
        <path ref={capitalRef} d={capitalD} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={lineClass} />
        {tipShown && tip && <circle cx={tip.px} cy={tip.py} r="6" fill="#10b981" stroke="#fff" strokeWidth="2.5" />}
      </svg>
      <div className={"chart-tooltip" + (tipShown ? " show" : "")} id="growthTooltip" style={tip ? { left: tip.left + "px", top: tip.top + "px" } : undefined}>
        {tip && (
          <>
            <div className="tt-title">Année {tip.d.year}</div>
            <div className="tt-muted">Versements: {fmtEUR(tip.d.invested)}</div>
            <div className="tt-capital">Capital: {fmtEUR(tip.d.capital)}</div>
            <div className="tt-muted">Intérêts: {fmtEUR(tip.d.capital - tip.d.invested)}</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function Simulateur() {
  useTitle("Simulateur — Compound+");
  useReveal();

  const [params, setParams] = useState(loadParams);
  useEffect(() => { saveParams(params); }, [params]);
  const result = useMemo(() => simulate(params), [params]);
  const patch = (key) => (v) => setParams((p) => ({ ...p, [key]: v }));

  const showReal = params.inflationOn;
  const headline = showReal ? result.real : result.gross;
  const interests = showReal ? result.interestsReal : result.interestsGross;

  return (
    <>
      <Navbar />

      <main className="page-main container">
        <header className="page-header">
          <div>
            <h1 className="reveal">Simulez votre avenir financier</h1>
            <p className="lede reveal" style={{ "--reveal-delay": ".08s" }}>Ajustez les paramètres ci-dessous pour visualiser l'impact de vos choix d'investissement sur le long terme.</p>
          </div>
        </header>

        <div className="sim-grid">
          {/* ============ Colonne gauche : contrôles ============ */}
          <section className="card sim-controls reveal" aria-label="Paramètres de simulation">

            <div className="slider-group">
              <div className="slider-head">
                <label htmlFor="initial">Capital initial</label>
                <PopValue className="slider-value">{fmtEUR(params.initial)}</PopValue>
              </div>
              <Slider id="initial" min={0} max={100000} step={500} value={params.initial} onChange={patch("initial")} />
              <div className="slider-scale"><span>0 €</span><span>100 000+ €</span></div>
            </div>

            <div className="slider-group">
              <div className="slider-head">
                <label htmlFor="monthly">Épargne mensuelle</label>
                <PopValue className="slider-value">{fmtEUR(params.monthly)}</PopValue>
              </div>
              <Slider id="monthly" min={0} max={5000} step={25} value={params.monthly} onChange={patch("monthly")} />
              <div className="slider-scale"><span>0 €</span><span>5 000 €</span></div>
            </div>

            <div className="slider-group">
              <div className="slider-head">
                <label htmlFor="years">Horizon de placement</label>
                <PopValue className="slider-value">{params.years + (params.years > 1 ? " ans" : " an")}</PopValue>
              </div>
              <Slider id="years" min={1} max={40} step={1} value={params.years} onChange={patch("years")} />
              <div className="slider-scale"><span>1 an</span><span>40 ans</span></div>
            </div>

            <div className="slider-group">
              <div className="slider-head">
                <label htmlFor="rate">Taux de rendement annuel (brut)</label>
                <PopValue className="slider-value green">{fmtPctFr(params.rate)}</PopValue>
              </div>
              <Slider id="rate" min={0} max={15} step={0.1} value={params.rate} onChange={patch("rate")} />
            </div>

            <h3 className="adv-title">Paramètres avancés</h3>

            <div className={"adv-card" + (params.inflationOn ? "" : " off")} id="inflationCard">
              <div className="adv-head">
                <span className="adv-label">Inflation annuelle estimée</span>
                <Switch id="inflationOn" checked={params.inflationOn} onChange={patch("inflationOn")} label="Prendre en compte l'inflation dans le calcul" />
              </div>
              <div className="adv-body">
                <p className="adv-desc">Permet d'estimer le rendement réel en tenant compte de la perte de pouvoir d'achat.</p>
                <output className="adv-value">{fmtPctFr(params.inflation)}</output>
              </div>
              <Slider id="inflation" min={0} max={6} step={0.1} value={params.inflation} disabled={!params.inflationOn} onChange={patch("inflation")} />
            </div>

            <div className={"adv-card" + (params.feesOn ? "" : " off")} id="feesCard">
              <div className="adv-head">
                <span className="adv-label">Frais de gestion annuels</span>
                <Switch id="feesOn" checked={params.feesOn} onChange={patch("feesOn")} label="Déduire les frais de gestion du rendement" />
              </div>
              <div className="adv-body">
                <p className="adv-desc">Les frais réduisent le rendement annuel net de votre placement.</p>
                <output className="adv-value">{fmtPctFr(params.fees)}</output>
              </div>
              <Slider id="fees" min={0} max={3} step={0.1} value={params.fees} disabled={!params.feesOn} onChange={patch("fees")} />
            </div>
          </section>

          {/* ============ Colonne droite : résultats ============ */}
          <section className="sim-results" aria-label="Résultats de simulation">

            <div className="result-card-dark reveal">
              <svg className="corner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
              <p className="result-label">{showReal ? "Capital corrigé de l'inflation" : "Capital final estimé"}</p>
              <p className="result-amount"><TweenNumber value={headline} format={fmtEUR} /></p>
              <div className="result-pills">
                <span className="pill pill-green">
                  <svg viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 9 7 3l3 3 3-5" /></svg>
                  <span>{(interests >= 0 ? "+ " : "− ") + fmtEUR(Math.abs(interests)) + (showReal ? " d'intérêts réels" : " d'intérêts")}</span>
                </span>
                {showReal && <span className="pill pill-blue">Capital brut: {fmtEUR(result.gross)}</span>}
              </div>
            </div>

            <div className="stats-grid">
              <div className="card stat-card reveal" style={{ "--reveal-delay": ".08s" }}>
                <div className="stat-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
                  </svg>
                  <h3>Total de vos versements</h3>
                </div>
                <p className="stat-value"><TweenNumber value={result.invested} format={fmtEUR} /></p>
              </div>
              <div className="card stat-card reveal" style={{ "--reveal-delay": ".16s" }}>
                <div className="stat-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="19" x2="5" y1="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                  <h3>Rendement net estimé après frais</h3>
                </div>
                <p className="stat-value green">{fmtPctFr(result.netRate)}</p>
                <p className="stat-note">{params.feesOn ? `(${fmtPctFr(params.rate)} brut - ${fmtPctFr(params.fees)} frais)` : "(aucuns frais déduits)"}</p>
              </div>
            </div>

            <div className="card chart-card reveal" style={{ "--reveal-delay": ".2s" }}>
              <h3>Évolution du capital dans le temps</h3>
              <p className="chart-sub">Comparaison entre vos versements cumulés et le capital estimé avec intérêts composés</p>
              <GrowthChart series={result.series} years={params.years} />
              <div className="chart-legend">
                <span><i className="legend-dot" style={{ background: "#0f172a" }}></i>Versements cumulés</span>
                <span><i className="legend-dot" style={{ background: "#10b981" }}></i>Capital estimé</span>
              </div>
            </div>
          </section>
        </div>

        {/* ============ CTA vers l'analyse ============ */}
        <div className="cta-dark reveal">
          <h2>Voyez la différence</h2>
          <p>Accédez dès maintenant à notre analyse détaillée ainsi qu'à une comparaison entre votre stratégie et les placements de référence.</p>
          <Link to="/chargement" className="btn btn-pill btn-light" id="ctaAnalyse">
            Acceder à l'analyse gratuitement
            <svg className="icon icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
