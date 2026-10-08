// Bottom sheet of the same night sky. Weekly contributions become the dark treeline.
// Taller means a busier week.

import { W, C, svg, clipPath, skyDefs, skyFill, grain } from "./common.mjs";

const H = 280;
const WEEKS = 53;
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

function buildGrid(days, lastDate) {
  const last = new Date(lastDate + "T00:00:00Z");
  const start = addDays(last, -last.getUTCDay() - (WEEKS - 1) * 7);
  const grid = [];
  for (let i = 0; i < WEEKS; i++) {
    const col = [];
    for (let j = 0; j < 7; j++) {
      const date = iso(addDays(start, i * 7 + j));
      col.push(date > lastDate ? null : { date, count: days[date] ?? 0 });
    }
    grid.push(col);
  }
  return grid;
}

export function renderGarden({ days, stats }) {
  const grid = buildGrid(days, stats.lastDataDate);
  const weeks = grid.map((col) => ({
    total: col.reduce((s, c) => s + (c ? c.count : 0), 0),
    date: col.find(Boolean)?.date ?? "",
  }));
  const max = Math.max(1, ...weeks.map((w) => w.total));
  const base = 214;
  const maxH = 72;
  const gap = W / WEEKS;
  const pts = weeks.map((w, i) => {
    const bh = w.total <= 0 ? 16 : Math.round(24 + maxH * Math.sqrt(w.total / max));
    return [i * gap + gap / 2, base - bh];
  });
  let line = `M0 ${H} L0 ${base - 10}`;
  pts.forEach(([x, y], i) => {
    if (i === 0) {
      line += ` L${x.toFixed(1)} ${y}`;
      return;
    }
    const [px, py] = pts[i - 1];
    line += ` Q${px.toFixed(1)} ${py} ${((px + x) / 2).toFixed(1)} ${((py + y) / 2).toFixed(1)}`;
  });
  const last = pts[pts.length - 1];
  line += ` Q${last[0].toFixed(1)} ${last[1]} ${W} ${base - 12} L${W} ${H} Z`;

  const peak = stats.busiest?.count
    ? `가장 바빴던 날 ${stats.busiest.date}, ${stats.busiest.count}회.`
    : "";

  const defs = `
  ${clipPath("win", { h: H, bottom: true })}
  ${skyDefs("sky", 360)}`;
  const body = `
<g clip-path="url(#win)">
  ${skyFill("sky", H)}
  <ellipse cx="160" cy="48" rx="200" ry="26" fill="#e7a8bc" opacity=".08" filter="url(#soft)"/>
  <path d="${line}" fill="#100e18"/>
  ${grain(H)}
  <text x="64" y="40" font-size="14" fill="${C.text}">지난 1년</text>
</g>`;

  return svg({
    h: H,
    title: "지난 1년의 기여를 밤하늘 아래 실루엣으로 그린 그림",
    desc: peak,
    defs,
    body,
  });
}
