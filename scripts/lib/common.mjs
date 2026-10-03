// Shared primitives for the Night City console.
// GitHub README SVGs are loaded as <img>, so no JS, no external fonts, no hover.

export const W = 960;

export const C = {
  bg: "#07060c",
  panel: "#0c0e1a",
  cyan: "#00e8ff",
  magenta: "#ff2d95",
  yellow: "#fcee0a",
  green: "#3dff9a",
  red: "#ff003c",
  text: "#eaf4ff",
  dim: "#8a93b5",
  faint: "#3d4666",
};

export const FONT = "'JetBrains Mono','Fira Code',Consolas,'SF Mono','Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR','NanumGothic','DejaVu Sans Mono','Courier New',monospace";

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Extra tracking via dx. SVG letter-spacing draws tofu circles in some Chromium/Windows fonts. */
export function spaced(text, dx = 6) {
  return [...String(text)].map((ch, i) => (i === 0 ? esc(ch) : `<tspan dx="${dx}">${esc(ch)}</tspan>`)).join("");
}

/** Same seed + same data => same city. Avoids empty daily commits. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const COMMON_DEFS = `
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M40 0H0V40" fill="none" stroke="#1a2142" stroke-width="1" opacity=".5"/>
  </pattern>
  <pattern id="scan" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect width="6" height="1" fill="#000" opacity=".12"/>
  </pattern>
  <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0a0814"/>
    <stop offset="1" stop-color="#05040a"/>
  </linearGradient>
  <radialGradient id="vignette" cx="50%" cy="45%" r="72%">
    <stop offset="70%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity=".22"/>
  </radialGradient>
  <filter id="glow" filterUnits="userSpaceOnUse" x="-60" y="-120" width="1080" height="1600">
    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glowL" filterUnits="userSpaceOnUse" x="-80" y="-140" width="1120" height="1640">
    <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glowS" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

const COMMON_STYLE = `
  text{font-family:${FONT};}
  .blink{animation:blink 1.1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  .pulse{animation:pulse 2.4s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`;

export function svg({ w = W, h, title, desc = "", defs = "", style = "", body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>${desc ? `<desc>${esc(desc)}</desc>` : ""}
<defs>${COMMON_DEFS}${defs}</defs>
<style>${COMMON_STYLE}${style}</style>
${body}
</svg>
`;
}

export function clipPath(id, { w = W, h, top = false, bottom = false }) {
  const r = 12;
  const t = top ? r : 0;
  const b = bottom ? r : 0;
  const d =
    `M0 ${t}` +
    (top ? ` Q0 0 ${r} 0 H${w - r} Q${w} 0 ${w} ${r}` : ` V0 H${w}`) +
    ` V${h - b}` +
    (bottom ? ` Q${w} ${h} ${w - r} ${h} H${r} Q0 ${h} 0 ${h - r}` : ` V${h} H0`) +
    ` Z`;
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>`;
}

export function background({ w = W, h }) {
  return `<rect width="${w}" height="${h}" fill="url(#bgGrad)"/>
<rect width="${w}" height="${h}" fill="url(#grid)"/>`;
}

export function scanOverlay({ w = W, h }) {
  return `<rect width="${w}" height="${h}" fill="url(#scan)" pointer-events="none"/>
<rect width="${w}" height="${h}" fill="url(#vignette)" pointer-events="none"/>`;
}

export function frame({ w = W, h, top = false, bottom = false, left = true, right = true }) {
  const r = 12;
  const x0 = 1;
  const x1 = w - 1;
  const yTop = top ? r : -40;
  const yBot = bottom ? h - r : h + 40;
  const main = [];
  if (left) main.push(`M${x0} ${yTop}V${yBot}`);
  if (right) main.push(`M${x1} ${yTop}V${yBot}`);
  if (top) main.push(`M${x0} ${r}Q${x0} 1 ${x0 + r} 1H${x1 - r}Q${x1} 1 ${x1} ${r}`);
  if (bottom) main.push(`M${x0} ${h - r}Q${x0} ${h - 1} ${x0 + r} ${h - 1}H${x1 - r}Q${x1} ${h - 1} ${x1} ${h - r}`);

  const inner = [];
  if (left) inner.push(`M7 -40V${h + 40}`);
  if (right) inner.push(`M${w - 7} -40V${h + 40}`);

  const ticks = [];
  for (let y = 20; y < h; y += 40) {
    if (left) ticks.push(`M1 ${y}h10`);
    if (right) ticks.push(`M${w - 1} ${y}h-10`);
  }

  return `<g fill="none">
<path d="${inner.join("")}" stroke="${C.cyan}" stroke-width="1" opacity=".16"/>
<path d="${ticks.join("")}" stroke="${C.yellow}" stroke-width="1" opacity=".35"/>
<path d="${main.join("")}" stroke="${C.cyan}" stroke-width="2" filter="url(#glow)"/>
</g>`;
}

export function sectionLabel({ x = 40, y = 40, no, name, right = "", color = C.yellow }) {
  return `<g>
<text x="${x}" y="${y}" font-size="12" fill="${C.dim}">${esc(no)} //</text>
<text x="${x + 46}" y="${y}" font-size="15" font-weight="700" fill="${color}" filter="url(#glowS)">${esc(name)}</text>
${right ? `<text x="${W - 40}" y="${y}" font-size="11" fill="${C.dim}" text-anchor="end">${esc(right)}</text>` : ""}
<path d="M${x} ${y + 12}H${W - 40}" stroke="${C.cyan}" stroke-width="1" opacity=".22"/>
<path d="M${x} ${y + 12}H${x + 132}" stroke="${color}" stroke-width="2" filter="url(#glowS)"/>
</g>`;
}

export function chamfer(x, y, w, h, c = 10) {
  return `${x},${y} ${x + w - c},${y} ${x + w},${y + c} ${x + w},${y + h} ${x + c},${y + h} ${x},${y + h - c}`;
}

export function chip(x, y, label, color, { fs = 12, h = 24 } = {}) {
  const cw = fs * 0.6;
  const w = Math.round(label.length * cw + 20);
  return [
    `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-opacity=".55"/>` +
      `<text x="${x + w / 2}" y="${y + h / 2 + fs * 0.35}" font-size="${fs}" fill="${color}" text-anchor="middle">${esc(label)}</text></g>`,
    w,
  ];
}

export function hudCorners(x, y, w, h, color = C.cyan, arm = 16) {
  const x2 = x + w;
  const y2 = y + h;
  return `<g fill="none" stroke="${color}" stroke-width="1.6" opacity=".85" filter="url(#glowS)">
<path d="M${x} ${y + arm}V${y}H${x + arm}"/><path d="M${x2 - arm} ${y}H${x2}V${y + arm}"/>
<path d="M${x} ${y2 - arm}V${y2}H${x + arm}"/><path d="M${x2 - arm} ${y2}H${x2}V${y2 - arm}"/>
</g>`;
}

/**
 * SMIL typewriter. Each line is clipped char-by-char; textLength keeps advance stable
 * across fallback monospace fonts.
 */
export function typewriter({ x = 40, fs = 16, lines, hold = 7, idPrefix = "ty" }) {
  const cw = fs * 0.6;
  let t = 0.5;
  const plan = lines.map((l) => {
    const full = (l.prompt ? l.prompt + " " : "") + l.text;
    const n = full.length;
    const start = t;
    const end = start + n / l.cps;
    t = end + (l.pause ?? 0.3);
    return { ...l, full, n, start, end };
  });
  const cycle = Math.ceil(t + hold);
  const reset = cycle - 0.4;
  const nt = (s) => Math.min(0.9999, s / cycle).toFixed(4);

  let out = "";
  plan.forEach((l, k) => {
    const id = `${idPrefix}${k}`;
    const kt = ["0"];
    const vals = ["0"];
    for (let c = 1; c <= l.n; c++) {
      kt.push(nt(l.start + (c - 1) / l.cps));
      vals.push((c * cw).toFixed(2));
    }
    kt.push(nt(reset));
    vals.push("0");
    const fh = Math.ceil(fs * 1.5);
    const top = l.y - Math.round(fs * 1.15);
    out += `<clipPath id="${id}"><rect x="${x}" y="${top}" width="0" height="${fh}">` +
      `<animate attributeName="width" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt.join(";")}" values="${vals.join(";")}"/>` +
      `</rect></clipPath>`;

    const body = l.prompt
      ? `<tspan fill="${C.green}">${esc(l.prompt)}</tspan><tspan> </tspan><tspan fill="${l.color}">${esc(l.text)}</tspan>`
      : `<tspan fill="${l.color}">${esc(l.text)}</tspan>`;
    out += `<text x="${x}" y="${l.y}" font-size="${fs}" textLength="${(l.n * cw).toFixed(2)}" lengthAdjust="spacing" clip-path="url(#${id})" xml:space="preserve">${body}</text>`;

    const nextStart = plan[k + 1] ? plan[k + 1].start : reset;
    const ckt = ["0"];
    const cx = [x.toFixed(2)];
    for (let c = 1; c <= l.n; c++) {
      ckt.push(nt(l.start + (c - 1) / l.cps));
      cx.push((x + c * cw).toFixed(2));
    }
    const okt = ["0", nt(l.start), nt(nextStart), nt(reset)];
    out += `<g opacity="0"><animate attributeName="opacity" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${okt.join(";")}" values="0;1;0;0"/>` +
      `<rect class="blink" x="${x}" y="${l.y - Math.round(fs * 0.95)}" width="${Math.round(cw)}" height="${Math.round(fs * 1.2)}" fill="${C.cyan}" filter="url(#glowS)">` +
      `<animate attributeName="x" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${ckt.join(";")}" values="${cx.join(";")}"/>` +
      `</rect></g>`;
  });
  return { markup: out, cycle };
}
