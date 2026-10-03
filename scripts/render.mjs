// Renders every SVG slice of the console into /assets from JSON in /data.
// Deterministic: same inputs => same SVGs => no empty daily commits.

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { renderCity, weeklyTotals } from "./lib/city.mjs";
import {
  renderHeader, renderIdentity, renderStatus, renderProjectsHead, renderProjectCard,
  renderProjectsMore, renderStack, renderFooter,
} from "./lib/sections.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "assets");
const readJson = async (f) => JSON.parse(await readFile(path.join(ROOT, "data", f), "utf8"));

const stats = await readJson("stats.json");
const { days } = await readJson("contributions.json");
const { projects } = await readJson("projects.json");
const user = stats.user;

await rm(ASSETS, { recursive: true, force: true });
await mkdir(ASSETS, { recursive: true });

const out = {
  "00-header.svg": renderHeader({ user }),
  "01-identity.svg": renderIdentity({ user }),
  "02-city.svg": renderCity({ days, stats }),
  "03-status.svg": renderStatus({ stats, weekly: weeklyTotals(days, stats.lastDataDate) }),
  "04-projects-head.svg": renderProjectsHead(projects.length),
  "04-projects-more.svg": renderProjectsMore({ user, repos: stats.repos }),
  "05-stack.svg": renderStack(),
  "06-footer.svg": renderFooter({ user, stats }),
};
projects.forEach((p, k) => {
  out[`projects/${p.repo}.svg`] = renderProjectCard(p, k, k % 2 === 0 ? "left" : "right");
});

for (const [name, content] of Object.entries(out)) {
  const file = path.join(ASSETS, name);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

const slices = [
  `<img src="./assets/00-header.svg" width="100%" align="top" alt="">`,
  `<img src="./assets/01-identity.svg" width="100%" align="top" alt="">`,
  `<img src="./assets/02-city.svg" width="100%" align="top" alt="">`,
  `<img src="./assets/03-status.svg" width="100%" align="top" alt="">`,
  `<img src="./assets/04-projects-head.svg" width="100%" align="top" alt="">`,
  ...projects.map((p) => `<img src="./assets/projects/${p.repo}.svg" width="50%" align="top" alt="">`),
  `<img src="./assets/04-projects-more.svg" width="100%" align="top" alt="">`,
  `<img src="./assets/05-stack.svg" width="100%" align="top" alt="">`,
  `<img src="./assets/06-footer.svg" width="100%" align="top" alt="">`,
];

await writeFile(
  path.join(ROOT, "_preview.html"),
  `<!doctype html><html><head><meta charset="utf-8"><title>console preview</title>
<style>html,body{margin:0;background:#0d1117}p{margin:0 auto;width:min(960px,100%)}img{display:block}</style>
</head><body><p>${slices.join("")}</p></body></html>\n`,
);

console.log(`[render] wrote ${Object.keys(out).length} SVG files to assets/`);
