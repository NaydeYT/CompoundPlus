/* Génère public/og-image.png (1200×630) à partir de public/og-image.svg.
   Lancer avec : npm run og  (nécessite la devDependency @resvg/resvg-js) */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const svgPath = fileURLToPath(new URL("../public/og-image.svg", import.meta.url));
const pngPath = fileURLToPath(new URL("../public/og-image.png", import.meta.url));

const svg = readFileSync(svgPath);
const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { loadSystemFonts: true }
});
writeFileSync(pngPath, resvg.render().asPng());
console.log("✓ public/og-image.png généré (1200×630)");
