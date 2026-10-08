// Stacks the three profile sheets. No gap between images.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stats = JSON.parse(await readFile(path.join(ROOT, "data", "stats.json"), "utf8"));

const img = (src, alt) =>
  `<img src="${src}" width="100%" align="top" alt="${alt.replace(/"/g, "&quot;")}">`;

const peak = stats.busiest?.count
  ? `지난 1년. 가장 바빴던 날 ${stats.busiest.date}, ${stats.busiest.count}회.`
  : "지난 1년의 기여";

const md = `<p align="center">
${img("./assets/00-header.svg", `${stats.user ?? "qormsxo"}, 백엔드 개발자`)}${img("./assets/01-about.svg", "Java, Spring Boot, Node.js, TypeScript, NestJS, React. PostgreSQL, Redis, BullMQ. Interested in AI-assisted development and automation.")}${img("./assets/02-garden.svg", peak)}
</p>
`;

await writeFile(path.join(ROOT, "README.md"), md);
console.log("[readme] wrote README.md");
