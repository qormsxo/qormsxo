// A year of contributions as ink bars on paper. One bar per week.
// Height uses a square root so a busy week stays tall without flattening the rest.

import { W, C, esc, svg, clipPath, background, frame } from "./common.mjs";

const H = 220;
const WEEKS = 53;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

function buildGrid(days, lastDate) {
  const last = new Date(lastDate + "T00:00:00Z");
  const sundayThisWeek = addDays(last, -last.getUTCDay());
  const start = addDays(sundayThisWeek, -(WEEKS - 1) * 7);
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

export function renderCity({ days, stats }) {
  const grid = buildGrid(days, stats.lastDataDate);
  const weeks = grid.map((col) => ({
    total: col.reduce((s, c) => s + (c ? c.count : 0), 0),
    date: col.find(Boolean)?.date ?? "",
  }));
  const max = Math.max(1, ...weeks.map((w) => w.total));
  const left = 48;
  const base = 150;
  const maxH = 96;
  const gap = (W - left - 48) / WEEKS;

  let bars = "";
  let months = "";
  let lastMonth = -1;
  weeks.forEach((w, i) => {
    const h = w.total <= 0 ? 2 : Math.round(8 + maxH * Math.sqrt(w.total / max));
    const x = left + i * gap;
    const ink = w.total <= 0 ? C.faint : C.text;
    bars += `<rect x="${x.toFixed(1)}" y="${base - h}" width="${Math.max(2, gap - 3).toFixed(1)}" height="${h}" fill="${ink}"/>`;
    if (!w.date) return;
    const m = Number(w.date.slice(5, 7)) - 1;
    const dom = Number(w.date.slice(8, 10));
    if (m !== lastMonth && (dom <= 7 || i === 0)) {
      lastMonth = m;
      months += `<text x="${x.toFixed(1)}" y="${base + 22}" font-size="12" fill="${C.dim}">${MONTHS[m]}</text>`;
    }
  });

  const peak = stats.busiest?.count
    ? `Tallest week is the busiest. Peak day ${stats.busiest.count} on ${stats.busiest.date}.`
    : "One bar per week. Taller means more contributions.";

  const defs = clipPath("win", { h: H, bottom: true });
  const body = `
<g clip-path="url(#win)">
  ${background({ h: H })}
  <text x="48" y="36" font-size="13" fill="${C.magenta}">This year</text>
  <line x1="48" y1="${base}" x2="${W - 48}" y2="${base}" stroke="${C.faint}"/>
  ${bars}
  ${months}
  <text x="48" y="${H - 22}" font-size="13" fill="${C.dim}">${esc(peak)}</text>
</g>
${frame({ h: H, bottom: true })}`;

  return svg({
    h: H,
    title: "A year of GitHub contributions as weekly bars",
    desc: peak,
    defs,
    body,
  });
}
