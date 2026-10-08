// Draws the profile sheets: name, intro, and a year of plants.

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { renderGarden } from "./lib/garden.mjs";
import { renderHeader, renderIdentity } from "./lib/sections.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "assets");
const readJson = async (f) => JSON.parse(await readFile(path.join(ROOT, "data", f), "utf8"));

const stats = await readJson("stats.json");
const { days } = await readJson("contributions.json");

await rm(ASSETS, { recursive: true, force: true });
await mkdir(ASSETS, { recursive: true });

const out = {
  "00-header.svg": renderHeader({ user: stats.user }),
  "01-about.svg": renderIdentity(),
  "02-garden.svg": renderGarden({ days, stats }),
};

for (const [name, content] of Object.entries(out)) {
  await writeFile(path.join(ASSETS, name), content);
}

console.log(`[render] wrote ${Object.keys(out).length} SVG files to assets/`);
