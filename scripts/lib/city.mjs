// Contribution City: 53x7 GitHub calendar lifted into an oblique Night City skyline.
// Height uses the blog's square-root curve so quiet days still form a district
// instead of a parking lot with one tower.

import { W, C, esc, mulberry32, hashString, svg, clipPath, scanOverlay, frame, sectionLabel } from "./common.mjs";

const H = 400;
const WEEKS = 53;
const TILE_X = 16;
const ROW_DX = -6;
const ROW_DY = 11;
const BW = 11;
const DEP = [4, -6];
const BASE = 8;
const MAXH = 110;
const Y0 = 196;
const OX = Math.round((W - (WEEKS * TILE_X + 6 * -ROW_DX)) / 2 + 6 * -ROW_DX);

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Quiet days stay teal; peak days go magenta / yellow like Night City signage.
const LEVELS = [
  null,
  { top: "#1f6d7c", front: "#0a1824", side: "#07101a", glow: false },
  { top: "#00b4cc", front: "#0c2438", side: "#081828", glow: false },
  { top: "#00e8ff", front: "#12344c", side: "#0a2438", glow: true },
  { top: "#fcee0a", front: "#3a2208", side: "#261606", glow: true },
];

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

export function weeklyTotals(days, lastDate, weeks = 26) {
  const grid = buildGrid(days, lastDate);
  return grid.slice(-weeks).map((col) => col.reduce((s, c) => s + (c ? c.count : 0), 0));
}

function sky() {
  const rnd = mulberry32(20261003);
  let stars = "";
  for (let k = 0; k < 52; k++) {
    const x = Math.round(rnd() * 940 + 10);
    const y = Math.round(rnd() * 150 + 52);
    const r = rnd() < 0.18 ? 1.6 : 1;
    stars += `<circle class="tw${(k % 3) + 1}" cx="${x}" cy="${y}" r="${r}" fill="#d7e7ff"/>`;
  }

  let sil = `M0 ${Y0 + 28}`;
  const srnd = mulberry32(91);
  let x = 0;
  while (x < W) {
    const w = 16 + Math.round(srnd() * 28);
    const h = 14 + Math.round(srnd() * 70);
    sil += `V${Y0 + 16 - h}h${w}`;
    x += w;
  }
  sil += `V${Y0 + 28}Z`;

  let rain = "";
  const rr = mulberry32(404);
  for (let i = 0; i < 22; i++) {
    const rx = Math.round(rr() * 920 + 20);
    const ry = Math.round(rr() * 160 + 50);
    const len = 10 + Math.round(rr() * 16);
    const dur = (1.6 + rr() * 1.4).toFixed(2);
    const delay = (rr() * 2).toFixed(2);
    rain += `<line class="rain" x1="${rx}" y1="${ry}" x2="${rx - 4}" y2="${ry + len}" stroke="#9ad8ff" stroke-opacity=".22">
      <animate attributeName="y1" values="${ry};${ry + 90}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="y2" values="${ry + len};${ry + 90 + len}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="x1" values="${rx};${rx - 18}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="${rx - 4};${rx - 22}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </line>`;
  }

  return `
<circle cx="848" cy="108" r="78" fill="url(#moonHalo)"/>
<circle cx="848" cy="108" r="18" fill="#f4e8ff"/>
<circle cx="840" cy="102" r="3.2" fill="#d4c4ee"/><circle cx="856" cy="114" r="2.2" fill="#d4c4ee"/>
${stars}
<path d="${sil}" fill="#080614" opacity=".92"/>
<path d="${sil}" fill="none" stroke="${C.magenta}" stroke-opacity=".16"/>
${rain}
<g class="plane"><g transform="translate(0 118)">
  <path d="M0 0h16l4 -2h-6l-3 -4h-2l2 4h-11z" fill="#b8c6dc"/>
  <circle class="beaconR" cx="2" cy="0" r="1.7" fill="${C.red}" filter="url(#glowS)"/>
  <circle class="beaconW" cx="18" cy="-1" r="1.3" fill="#fff" filter="url(#glowS)"/>
</g></g>`;
}

export function renderCity({ days, stats }) {
  const lastDate = stats.lastDataDate;
  const grid = buildGrid(days, lastDate);
  const flat = grid.flat().filter(Boolean);
  const max = Math.max(1, ...flat.map((c) => c.count));
  const firstLight = flat.find((c) => c.count > 0)?.date ?? lastDate;
  const activeDays = flat.filter((c) => c.count > 0).length;

  const plateL = OX;
  const plateR = OX + WEEKS * TILE_X;
  const yb = Y0 + ROW_DY * 6 + 18;
  const shift = ROW_DX * 6 - 3;
  const plate = `${plateL},${Y0 + 2} ${plateR},${Y0 + 2} ${plateR + shift},${yb} ${plateL + shift},${yb}`;

  let streets = "";
  for (let j = 1; j <= 6; j++) {
    const y = Y0 + 2 + ROW_DY * j - 3;
    streets += `M${plateL + ROW_DX * j + 1},${y}H${plateR + ROW_DX * j - 1}`;
  }

  const lots = [];
  const buildings = [];
  const sheen = [];
  const tall = [];

  for (let j = 0; j < 7; j++) {
    for (let i = 0; i < WEEKS; i++) {
      const cell = grid[i][j];
      if (!cell) continue;
      const fx = OX + i * TILE_X + j * ROW_DX + 2;
      const fy = Y0 + j * ROW_DY + 10;
      if (cell.count <= 0) {
        lots.push(`M${fx} ${fy}h${BW}l${DEP[0]} ${DEP[1]}h-${BW}z`);
        continue;
      }

      const ratio = cell.count / max;
      const h = Math.round(BASE + MAXH * Math.sqrt(ratio));
      const lv = ratio < 0.22 ? 1 : ratio < 0.48 ? 2 : ratio < 0.78 ? 3 : 4;
      const L = LEVELS[lv];

      let g = "";
      g += `<rect fill="${L.front}" x="${fx}" y="${fy - h}" width="${BW}" height="${h}"/>`;
      g += `<path fill="${L.side}" d="M${fx + BW} ${fy}l${DEP[0]} ${DEP[1]}v${-h}l${-DEP[0]} ${-DEP[1]}z"/>`;
      g += `<path fill="${L.top}"${L.glow ? ` filter="url(#glowS)"` : ""} d="M${fx} ${fy - h}h${BW}l${DEP[0]} ${DEP[1]}h-${BW}z"/>`;

      if (h >= 14) {
        const rnd = mulberry32(hashString(cell.date));
        const color = ["#ffd86b", "#7df9ff", "#ff8aea"][Math.floor(rnd() * 3)];
        let d = "";
        let flick = "";
        for (let y = fy - 5; y - 3 > fy - h + 3; y -= 6) {
          for (const cx of [fx + 2, fx + 6]) {
            const r = rnd();
            if (r < 0.52) {
              if (r < 0.05) {
                flick += `<rect class="fl${Math.floor(rnd() * 3) + 1}" fill="${color}" x="${cx}" y="${y - 3}" width="3" height="3"/>`;
              } else {
                d += `M${cx} ${y - 3}h3v3h-3z`;
              }
            }
          }
        }
        if (d) g += `<path fill="${color}" opacity=".9" d="${d}"/>`;
        g += flick;
      }

      // Wet-street sheen: a short faded front face below the lot.
      const rh = Math.max(4, Math.round(h * 0.22));
      sheen.push(`<rect x="${fx}" y="${fy + 1}" width="${BW}" height="${rh}" fill="${L.top}" opacity=".12"/>`);

      buildings.push(g);
      if (lv >= 3) tall.push({ x: fx + BW / 2 + 1, y: fy - h - 2, n: cell.count, lv });
    }
  }

  tall.sort((a, b) => b.n - a.n);
  let antennas = "";
  tall.slice(0, 8).forEach((t, k) => {
    const sign = k < 3
      ? `<rect x="${t.x - 5}" y="${t.y - 7}" width="10" height="3" fill="${k === 0 ? C.yellow : k === 1 ? C.magenta : C.cyan}" opacity=".85" filter="url(#glowS)"/>`
      : "";
    antennas += `<path d="M${t.x} ${t.y}v-10" stroke="#c5d0e0" stroke-width="1"/>` +
      sign +
      `<circle class="beacon b${(k % 3) + 1}" cx="${t.x}" cy="${t.y - 11}" r="1.7" fill="${C.red}" filter="url(#glowS)"/>`;
  });

  let months = "";
  let lastMonth = -1;
  for (let i = 0; i < WEEKS; i++) {
    const first = grid[i].find(Boolean);
    if (!first) continue;
    const m = Number(first.date.slice(5, 7)) - 1;
    const dom = Number(first.date.slice(8, 10));
    if (m !== lastMonth && (dom <= 7 || i === 0)) {
      lastMonth = m;
      const x = OX + i * TILE_X + 6 * ROW_DX + 2;
      months += `<text x="${x}" y="${yb + 20}" font-size="11" fill="${C.text}" opacity=".75">${MONTHS[m]}</text>` +
        `<path d="M${x + 1} ${yb + 3}v5" stroke="${C.cyan}" stroke-opacity=".5"/>`;
    }
  }

  let legend = `<text x="40" y="${H - 28}" font-size="11" fill="${C.dim}">LOW</text>`;
  [1, 2, 3, 4].forEach((lv, k) => {
    legend += `<rect x="${72 + k * 16}" y="${H - 37}" width="11" height="11" fill="${LEVELS[lv].top}"${LEVELS[lv].glow ? ` filter="url(#glowS)"` : ""}/>`;
  });
  legend += `<text x="142" y="${H - 28}" font-size="11" fill="${C.dim}">PEAK</text>` +
    `<path d="M196 ${H - 37}h11l4 -4h-11z" fill="#0b1426" stroke="${C.faint}"/>` +
    `<text x="222" y="${H - 28}" font-size="11" fill="${C.dim}">EMPTY LOT</text>`;

  const peak = stats.busiest?.count
    ? `PEAK ${stats.busiest.count} @ ${stats.busiest.date}`
    : "PEAK --";

  const defs = `
  <clipPath id="plateClip"><polygon points="${plate}"/></clipPath>
  <radialGradient id="moonHalo"><stop offset="0" stop-color="#c48bff" stop-opacity=".42"/><stop offset="1" stop-color="#c48bff" stop-opacity="0"/></radialGradient>
  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#05040f"/>
    <stop offset=".5" stop-color="#160a2c"/>
    <stop offset=".82" stop-color="#3a1238"/>
    <stop offset="1" stop-color="#6a1c2e"/>
  </linearGradient>
  <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#10182e"/>
    <stop offset="1" stop-color="#070b16"/>
  </linearGradient>
  <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6a1c2e" stop-opacity="0"/>
    <stop offset="1" stop-color="#0a0610" stop-opacity=".55"/>
  </linearGradient>
  <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/>
    <stop offset=".5" stop-color="${C.cyan}" stop-opacity=".26"/>
    <stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
  </linearGradient>
  ${clipPath("win", { h: H })}`;

  const style = `
  .tw1{animation:tw 3.2s ease-in-out infinite}
  .tw2{animation:tw 4.6s ease-in-out -1.3s infinite}
  .tw3{animation:tw 2.6s ease-in-out -.7s infinite}
  @keyframes tw{0%,100%{opacity:.85}50%{opacity:.12}}
  .fl1{animation:fl 2.8s steps(1) infinite}
  .fl2{animation:fl 3.9s steps(1) -1s infinite}
  .fl3{animation:fl 5.1s steps(1) -2.2s infinite}
  @keyframes fl{0%{opacity:1}40%{opacity:.12}46%{opacity:1}70%{opacity:.12}74%{opacity:1}}
  .beacon{animation:bc 1.6s steps(1) infinite}
  .b2{animation-delay:-.5s}.b3{animation-delay:-1.1s}
  .beaconR{animation:bc 1.2s steps(1) infinite}
  .beaconW{animation:bc 2.4s steps(1) -.6s infinite}
  @keyframes bc{0%{opacity:1}50%{opacity:.12}}
  .plane{animation:fly 36s linear infinite}
  @keyframes fly{0%{transform:translateX(-70px)}100%{transform:translateX(1040px)}}`;

  const body = `
<g clip-path="url(#win)">
  <rect width="${W}" height="${H}" fill="url(#skyGrad)"/>
  ${sky()}
  <rect x="0" y="${Y0 - 30}" width="${W}" height="80" fill="url(#fog)"/>
  <polygon points="${plate}" fill="url(#plateGrad)" stroke="${C.cyan}" stroke-opacity=".32"/>
  <path d="${streets}" stroke="${C.cyan}" stroke-opacity=".1" fill="none"/>
  <g clip-path="url(#plateClip)"><rect x="-80" y="${Y0}" width="80" height="${yb - Y0}" fill="url(#sweep)">
    <animate attributeName="x" values="${OX - 120};${plateR + 40}" dur="8s" repeatCount="indefinite"/>
  </rect></g>
  <path d="${lots.join("")}" fill="#0b1426" stroke="${C.faint}" stroke-opacity=".45" stroke-width=".6"/>
  ${sheen.join("")}
  ${buildings.join("\n  ")}
  ${antennas}
  ${months}
  ${sectionLabel({ no: "02", name: "CONTRIBUTION_CITY", right: `LAST ${WEEKS} WEEKS  //  ${stats.user}` })}
  <text x="40" y="${H - 56}" font-size="11" fill="${C.faint}">1 BUILDING = 1 DAY  //  TALLER = MORE COMMITS  //  ${activeDays} LIT BLOCKS  //  FIRST LIGHT ${firstLight}</text>
  ${legend}
  <text x="${W - 40}" y="${H - 28}" font-size="11" fill="${C.yellow}" text-anchor="end">${esc(peak)}</text>
  ${scanOverlay({ h: H })}
</g>
${frame({ h: H })}`;

  return svg({
    h: H,
    title: "Contribution City: last 53 weeks of GitHub activity as a Night City skyline",
    desc: `One building per day. Taller means more contributions. Peak: ${stats.busiest?.count ?? 0} on ${stats.busiest?.date ?? "n/a"}.`,
    defs,
    style,
    body,
  });
}
