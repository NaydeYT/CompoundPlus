/* Compound+ — moteur de calcul d'intérêts composés + persistance des paramètres */

const STORAGE_KEY = "compoundplus.params";

export const DEFAULTS = {
  initial: 10000,   // capital initial (€)
  monthly: 300,     // épargne mensuelle (€)
  years: 15,        // horizon (années)
  rate: 5.0,        // rendement annuel brut (%)
  inflationOn: true,
  inflation: 2.0,   // inflation annuelle (%)
  feesOn: false,
  fees: 0.6         // frais de gestion annuels (%)
};

export function loadParams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveParams(params) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch { /* stockage indisponible : la simulation reste fonctionnelle */ }
}

/* Valeur future avec versements mensuels, capitalisation mensuelle. */
export function futureValue(initial, monthly, annualRatePct, years) {
  const months = Math.round(years * 12);
  const r = annualRatePct / 100 / 12;
  if (r === 0) return initial + monthly * months;
  const growth = Math.pow(1 + r, months);
  return initial * growth + monthly * ((growth - 1) / r);
}

/* Simulation complète : série annuelle + agrégats. */
export function simulate(p) {
  const netRate = p.rate - (p.feesOn ? p.fees : 0);
  const series = [];
  for (let y = 0; y <= p.years; y++) {
    series.push({
      year: y,
      invested: p.initial + p.monthly * 12 * y,
      capital: futureValue(p.initial, p.monthly, netRate, y)
    });
  }
  const invested = series[p.years].invested;
  const gross = series[p.years].capital;
  const inflFactor = p.inflationOn ? Math.pow(1 + p.inflation / 100, p.years) : 1;
  const real = gross / inflFactor;
  return {
    series,
    invested,
    gross,
    real,
    netRate,
    interestsGross: gross - invested,
    interestsReal: real - invested,
    interestShare: gross > 0 ? (gross - invested) / gross : 0
  };
}

const eurFmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function fmtEUR(x) { return eurFmt.format(Math.round(x)) + " €"; }

export function fmtEURk(x) {
  if (Math.abs(x) >= 1000) return Math.round(x / 1000) + "k €";
  return fmtEUR(x);
}

export function fmtPct(x, decimals = 1) {
  return x.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + " %";
}
