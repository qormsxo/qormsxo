// Console slices: boot header, identity TTY, status HUD, project nodes, stack, footer.

import {
  W, C, esc, spaced, svg, clipPath, background, scanOverlay, frame, sectionLabel, chamfer, chip, typewriter, hudCorners,
} from "./common.mjs";

const fmt = (n) => (n === null || n === undefined ? "--" : Number(n).toLocaleString("en-US"));

export function renderHeader({ user }) {
  const H = 320;
  const name = "배근태";
  const style = `
  .gA{animation:gA 6s steps(1) infinite}
  .gB{animation:gB 6s steps(1) infinite}
  @keyframes gA{0%,90%,100%{transform:translate(0,0)}91%{transform:translate(-7px,1px)}93%{transform:translate(5px,-1px)}95%{transform:translate(-2px,2px)}97%{transform:translate(0,0)}}
  @keyframes gB{0%,90%,100%{transform:translate(0,0)}91%{transform:translate(7px,-1px)}93%{transform:translate(-5px,1px)}95%{transform:translate(3px,-2px)}97%{transform:translate(0,0)}}
  .flick{animation:flick 8s steps(1) infinite}
  @keyframes flick{0%,62%,66%,100%{opacity:1}63%{opacity:.45}64%{opacity:1}65%{opacity:.7}}
  .eq{transform-box:fill-box;transform-origin:50% 100%;animation:eq 1.25s ease-in-out infinite}
  .e2{animation-duration:.85s;animation-delay:-.3s}.e3{animation-duration:1.55s;animation-delay:-.7s}
  .e4{animation-duration:1.05s;animation-delay:-.2s}.e5{animation-duration:1.85s;animation-delay:-1s}.e6{animation-duration:1.35s;animation-delay:-.5s}
  @keyframes eq{0%,100%{transform:scaleY(.22)}50%{transform:scaleY(1)}}`;

  const bars = [0, 1, 2, 3, 4, 5]
    .map((k) => `<rect class="eq e${k + 1}" x="${858 + k * 9}" y="86" width="5" height="30" fill="${k % 2 ? C.magenta : C.yellow}" opacity=".85"/>`)
    .join("");

  const defs = `
  ${clipPath("win", { h: H, top: true })}
  <radialGradient id="hgA" cx=".18" cy=".12" r=".75"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".14"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
  <radialGradient id="hgB" cx=".88" cy=".9" r=".7"><stop offset="0" stop-color="${C.magenta}" stop-opacity=".2"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/></radialGradient>
  <linearGradient id="hsweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.yellow}" stop-opacity="0"/><stop offset=".5" stop-color="${C.yellow}" stop-opacity="1"/><stop offset="1" stop-color="${C.yellow}" stop-opacity="0"/></linearGradient>`;

  const body = `
<g clip-path="url(#win)">
  ${background({ h: H })}
  <rect width="${W}" height="${H}" fill="url(#hgA)"/><rect width="${W}" height="${H}" fill="url(#hgB)"/>

  <rect width="${W}" height="40" fill="#08060f"/>
  <path d="M0 40H${W}" stroke="${C.yellow}" stroke-opacity=".35"/>
  <circle cx="30" cy="20" r="5" fill="${C.magenta}"/><circle cx="50" cy="20" r="5" fill="${C.yellow}"/><circle cx="70" cy="20" r="5" fill="${C.green}"/>
  <text x="480" y="25" font-size="12" fill="${C.dim}" text-anchor="middle">${esc("배근태")}@night-city : ~/profile  --  CYBERDECK v2.1</text>
  <circle class="pulse" cx="828" cy="20" r="4" fill="${C.green}" filter="url(#glowS)"/>
  <text x="926" y="25" font-size="12" fill="${C.green}" text-anchor="end">ONLINE</text>

  <g font-size="11" fill="${C.dim}">
    <text x="42" y="78">&gt; BOOT SEQUENCE ........ <tspan fill="${C.green}">OK</tspan></text>
    <text x="42" y="96">&gt; UPLINK ............... <tspan fill="${C.green}">STABLE</tspan></text>
    <text x="42" y="114">&gt; SECTOR ............... <tspan fill="${C.cyan}">BACKEND</tspan></text>
  </g>
  ${bars}
  <text x="918" y="132" font-size="10" fill="${C.faint}" text-anchor="end">SIGNAL</text>

  ${hudCorners(28, 142, W - 56, 128, C.cyan, 18)}

  <g font-size="108" font-weight="800" text-anchor="middle">
    <text class="gA" x="480" y="216" fill="${C.magenta}" opacity=".8">${spaced(name, 18)}</text>
    <text class="gB" x="480" y="216" fill="${C.cyan}" opacity=".8">${spaced(name, 18)}</text>
    <text class="flick" x="480" y="216" fill="#f6fdff" filter="url(#glowL)">${spaced(name, 18)}</text>
  </g>

  <text x="480" y="250" font-size="20" fill="${C.yellow}" text-anchor="middle" filter="url(#glowS)">${spaced("BACKEND DEVELOPER", 5)}</text>
  <text x="480" y="274" font-size="13" fill="${C.dim}" text-anchor="middle">Java / Spring boot / Node.js / JavaScript / TypeScript / NestJS   //   AI-assisted development &amp; automation</text>

  <rect x="40" y="292" width="${W - 80}" height="1" fill="${C.cyan}" opacity=".22"/>
  <rect x="-200" y="291" width="200" height="3" fill="url(#hsweep)" filter="url(#glowS)">
    <animate attributeName="x" values="-200;${W}" dur="5s" repeatCount="indefinite"/>
  </rect>
  <text class="blink" x="480" y="310" font-size="11" fill="${C.dim}" text-anchor="middle">[ SCROLL DOWN TO DESCEND INTO THE CITY ]</text>
  ${scanOverlay({ h: H })}
</g>
${frame({ h: H, top: true })}`;

  return svg({ h: H, title: `배근태 - Backend Developer, Night City console`, defs, style, body });
}

function wrapAt(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const out = [];
  let rest = text;
  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf(" / ", maxChars);
    if (cut < 8) cut = rest.lastIndexOf(" ", maxChars);
    if (cut < 8) cut = maxChars;
    out.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).replace(/^[\s/]+/, "");
  }
  if (rest) out.push(rest);
  return out;
}

export function renderIdentity({ user }) {
  const H = 320;
  // Left column ends before OPERATOR.PROFILE (x=664). 16px mono ≈ 9.6px/char.
  const maxChars = 58;
  const raw = [
    { prompt: "$", text: "whoami", color: C.text, cps: 12, pause: 0.25 },
    { text: "배근태 // backend developer", color: C.cyan, cps: 40, pause: 0.45 },
    { prompt: "$", text: "cat focus.txt", color: C.text, cps: 12, pause: 0.25 },
    ...wrapAt("Java / Spring Boot / Node.js / JavaScript / TypeScript / NestJS / PostgreSQL / Redis / BullMQ", maxChars)
      .map((text) => ({ text, color: C.text, cps: 55, pause: 0.1 })),
    { text: "async pipelines, caching, state machines, API design", color: C.dim, cps: 55, pause: 0.45 },
    { prompt: "$", text: "ai --interests", color: C.text, cps: 12, pause: 0.25 },
    { text: "AI-assisted development and automation", color: C.magenta, cps: 40, pause: 0.45 },
    { prompt: "$", text: "", color: C.text, cps: 4, pause: 0 },
  ];
  const lines = raw.map((l, k) => ({ ...l, y: 96 + k * 24 }));

  const ty = typewriter({ x: 40, fs: 15, lines });

  const rows = [
    ["HANDLE", user, C.cyan],
    ["CLASS", "Backend Developer", C.yellow],
    ["PRIMARY", "Java / JS / TypeScript", C.text],
    ["FRAMEWORK", "Spring Boot / NestJS", C.text],
    ["SIDE-QUEST", "AI x automation", C.magenta],
  ];
  const px = 664;
  const panel = rows
    .map(([k, v, col], n) => {
      const y = 112 + n * 34;
      return `<text x="${px + 18}" y="${y}" font-size="10" fill="${C.dim}">${k}</text>` +
        `<text x="${px + 18}" y="${y + 16}" font-size="13" fill="${col}">${esc(v)}</text>` +
        (n < rows.length - 1 ? `<path d="M${px + 18} ${y + 24}H${px + 238}" stroke="${C.cyan}" stroke-opacity=".12"/>` : "");
    })
    .join("");

  const defs = clipPath("win", { h: H });
  const body = `
<g clip-path="url(#win)">
  ${background({ h: H })}
  ${sectionLabel({ no: "01", name: "IDENTITY", right: "TTY0 // /bin/zsh" })}
  <polygon points="${chamfer(px, 70, 256, 216, 14)}" fill="${C.panel}" fill-opacity=".88" stroke="${C.yellow}" stroke-opacity=".4"/>
  <text x="${px + 18}" y="92" font-size="11" fill="${C.yellow}">OPERATOR.PROFILE</text>
  ${panel}
  ${ty.markup}
  ${scanOverlay({ h: H })}
</g>
${frame({ h: H })}`;
  return svg({
    h: H,
    title: `${user}: backend developer working with Node.js, TypeScript and NestJS, interested in AI-assisted development and automation`,
    defs, body,
  });
}

export function renderStatus({ stats, weekly }) {
  const H = 200;
  const cards = [
    { label: "CONTRIBUTIONS / 365D", value: fmt(stats.lastYear), sub: "public activity", color: C.cyan, spark: true },
    stats.allTime != null
      ? { label: "ALL-TIME", value: fmt(stats.allTime), sub: stats.since ? `since ${stats.since.slice(0, 4)}` : "", color: C.magenta }
      : { label: "BUSIEST DAY", value: fmt(stats.busiest?.count), sub: stats.busiest?.date || "", color: C.magenta },
    { label: "CURRENT STREAK", value: fmt(stats.currentStreak), sub: "days", color: C.green },
    { label: "LONGEST STREAK", value: fmt(stats.longestStreak), sub: "days", color: C.yellow },
    { label: "PUBLIC REPOS", value: fmt(stats.repos), sub: stats.since ? `member since ${stats.since.slice(0, 4)}` : "", color: C.cyan },
  ];
  const cw = 168;
  const gap = 10;
  let out = "";
  cards.forEach((c, k) => {
    const x = 40 + k * (cw + gap);
    const y = 72;
    const h = 104;
    out += `<g>
<polygon points="${chamfer(x, y, cw, h, 12)}" fill="${C.panel}" fill-opacity=".9" stroke="${c.color}" stroke-opacity=".5"/>
<path d="M${x + 12} ${y + h}H${x + cw - 30}" stroke="${c.color}" stroke-width="2" opacity=".9" filter="url(#glowS)"/>
<text x="${x + 14}" y="${y + 24}" font-size="10" fill="${C.dim}">${esc(c.label)}</text>
<text x="${x + 14}" y="${y + 64}" font-size="36" font-weight="800" fill="${c.color}" filter="url(#glowS)">${esc(c.value)}</text>
`;
    if (c.spark && weekly?.length) {
      const m = Math.max(1, ...weekly);
      const n = weekly.length;
      const step = (cw - 28) / n;
      weekly.forEach((v, i) => {
        const bh = Math.max(1.5, Math.round((v / m) * 20));
        out += `<rect x="${(x + 14 + i * step).toFixed(1)}" y="${y + 94 - bh}" width="${(step - 1.4).toFixed(1)}" height="${bh}" fill="${c.color}" opacity="${(0.35 + 0.65 * (v / m)).toFixed(2)}"/>`;
      });
    } else {
      out += `<text x="${x + 14}" y="${y + 86}" font-size="11" fill="${C.dim}">${esc(c.sub)}</text>`;
    }
    out += `</g>`;
  });

  const defs = clipPath("win", { h: H });
  const body = `
<g clip-path="url(#win)">
  ${background({ h: H })}
  ${sectionLabel({ no: "03", name: "SYSTEM_STATUS", right: `SYNC ${stats.lastDataDate}` })}
  ${out}
  ${scanOverlay({ h: H })}
</g>
${frame({ h: H })}`;
  return svg({
    h: H,
    title: `Status: ${stats.lastYear} contributions in the last year, current streak ${stats.currentStreak} days, longest streak ${stats.longestStreak} days, ${stats.repos} public repositories`,
    defs, body,
  });
}

export function renderProjectsHead(count) {
  const H = 80;
  const defs = clipPath("win", { h: H });
  const body = `
<g clip-path="url(#win)">
  ${background({ h: H })}
  ${sectionLabel({ no: "04", name: "PROJECTS", right: "SELECT A NODE > OPEN REPOSITORY", y: 44 })}
  <text x="40" y="74" font-size="11" fill="${C.faint}">${count} FEATURED REPOSITORIES  //  BACKEND SYSTEMS, QUEUES, CACHES AND AI INTEGRATIONS</text>
  ${scanOverlay({ h: H })}
</g>
${frame({ h: H })}`;
  return svg({ h: H, title: "Projects section header", defs, body });
}

export function renderProjectCard(p, index, side) {
  const w = 480;
  const H = 200;
  const accent = p.live ? C.green : /AI/.test(p.tag) ? C.magenta : C.cyan;
  const pw = 430;
  const px = side === "left" ? 40 : 10;
  const py = 8;
  const ph = 184;

  const lines = p.lines
    .map((l, k) => `<text x="${px + 20}" y="${py + 98 + k * 18}" font-size="12.5" fill="#b7c9e8">${esc(l)}</text>`)
    .join("");

  let chips = "";
  let cx = px + 20;
  for (const s of p.stack) {
    const [m, cwid] = chip(cx, py + 142, s, accent, { fs: 11, h: 22 });
    chips += m;
    cx += cwid + 8;
  }

  const id = `PRJ-${String(index + 1).padStart(2, "0")}`;
  const status = p.live
    ? `<circle class="pulse" cx="${px + pw - 78}" cy="${py + 29}" r="3.5" fill="${C.green}" filter="url(#glowS)"/><text x="${px + pw - 18}" y="${py + 33}" font-size="11" fill="${C.green}" text-anchor="end">LIVE</text>`
    : `<text x="${px + pw - 18}" y="${py + 33}" font-size="11" fill="${accent}" text-anchor="end">OPEN &gt;</text>`;

  const delay = (index * 0.9).toFixed(1);
  const defs = `
  ${clipPath("win", { w, h: H })}
  <clipPath id="pc"><polygon points="${chamfer(px, py, pw, ph, 14)}"/></clipPath>
  <linearGradient id="cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity="0"/><stop offset=".5" stop-color="${accent}" stop-opacity=".16"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>`;

  const body = `
<g clip-path="url(#win)">
  ${background({ w, h: H })}
  <polygon points="${chamfer(px, py, pw, ph, 14)}" fill="${C.panel}" fill-opacity=".92" stroke="${accent}" stroke-opacity=".55"/>
  <g clip-path="url(#pc)"><rect x="${px}" y="${py - 40}" width="${pw}" height="40" fill="url(#cs)">
    <animate attributeName="y" values="${py - 40};${py + ph}" dur="5.5s" begin="${delay}s" repeatCount="indefinite"/>
  </rect></g>
  <rect x="${px}" y="${py + 14}" width="3" height="${ph - 28}" fill="${accent}" filter="url(#glowS)"/>
  <text x="${px + 20}" y="${py + 33}" font-size="11" fill="${C.dim}">${id} <tspan fill="${accent}">[${esc(p.tag)}]</tspan></text>
  ${status}
  <text x="${px + 20}" y="${py + 68}" font-size="21" font-weight="700" fill="#f2fdff" filter="url(#glowS)">${esc(p.repo)}</text>
  ${lines}
  ${chips}
  ${scanOverlay({ w, h: H })}
</g>
${frame({ w, h: H, left: side === "left", right: side === "right" })}`;

  return svg({
    w,
    h: H,
    title: `${p.repo}: ${p.lines.join(" ")}`,
    desc: `Stack: ${p.stack.join(", ")}`,
    defs,
    body,
  });
}

export function renderProjectsMore({ user, repos }) {
  const H = 80;
  const defs = clipPath("win", { h: H });
  const label = `BROWSE ALL ${repos ?? ""} REPOSITORIES`.replace(/\s+/g, " ");
  const body = `
<g clip-path="url(#win)">
  ${background({ h: H })}
  <polygon points="${chamfer(240, 14, 480, 52, 14)}" fill="${C.yellow}" fill-opacity=".06" stroke="${C.yellow}" stroke-opacity=".7"/>
  <text x="480" y="46" font-size="14" fill="${C.yellow}" text-anchor="middle" filter="url(#glowS)">&gt;&gt; ${esc(label)} &lt;&lt;</text>
  <text x="480" y="62" font-size="10" fill="${C.dim}" text-anchor="middle">github.com/${esc(user)}</text>
  ${scanOverlay({ h: H })}
</g>
${frame({ h: H })}`;
  return svg({ h: H, title: `Browse all repositories of ${user}`, defs, body });
}

export function renderStack() {
  const H = 280;
  // Only technologies from the original profile badges or featured public READMEs.
  const rows = [
    ["LANGUAGES", C.cyan, ["Java", "TypeScript", "JavaScript",]],
    ["BACKEND", C.green, ["Spring boot", "Node.js", "NestJS", "Express", "NPM"]],
    ["DATA / QUEUES", C.yellow, ["MySQL","PostgreSQL", "Redis", "BullMQ", "Kafka"]],
    ["AI / AUTOMATION", C.magenta, ["Gemini API", "OpenAI API", "GitHub Actions", "SSE"]],
    ["TOOLING", C.cyan, ["TypeORM", "Prisma", "Docker", "Swagger", "Jest", "k6"]],
  ];
  let out = "";
  rows.forEach(([label, color, items], r) => {
    const y = 68 + r * 38;
    out += `<text x="40" y="${y + 16}" font-size="11" fill="${C.dim}">${label}</text>`;
    out += `<path d="M40 ${y + 26}H${W - 40}" stroke="${C.cyan}" stroke-opacity=".08"/>`;
    let x = 200;
    for (const it of items) {
      const [m, wd] = chip(x, y, it, color, { fs: 13, h: 24 });
      out += m;
      x += wd + 10;
    }
  });
  const defs = clipPath("win", { h: H });
  const body = `
<g clip-path="url(#win)">
  ${background({ h: H })}
  ${sectionLabel({ no: "05", name: "TECH_STACK", right: "VERIFIED FROM PUBLIC REPOSITORIES" })}
  ${out}
  <text x="40" y="266" font-size="11" fill="${C.faint}">// listed: original README badges + what the featured projects actually use.</text>
  ${scanOverlay({ h: H })}
</g>
${frame({ h: H })}`;
  return svg({
    h: H,
    title: "Tech stack: TypeScript, JavaScript, Java, Node.js, NestJS, Express, PostgreSQL, Redis, BullMQ, Kafka, Gemini and OpenAI APIs, GitHub Actions, Docker",
    defs, body,
  });
}

export function renderFooter({ user, stats }) {
  const H = 240;
  const nodes = [
    ["GITHUB ACTIONS", "daily cron 15:17 UTC"],
    ["fetch.mjs", "GraphQL contributions"],
    ["render.mjs", "SVG city + HUD"],
    ["git commit", "only if changed"],
  ];
  const nw = 190;
  const gap = 40;
  let out = "";
  nodes.forEach(([t, s], k) => {
    const x = 40 + k * (nw + gap);
    out += `<polygon points="${chamfer(x, 74, nw, 56, 10)}" fill="${C.panel}" fill-opacity=".9" stroke="${C.cyan}" stroke-opacity=".55"/>` +
      `<text x="${x + nw / 2}" y="98" font-size="13" font-weight="700" fill="${C.cyan}" text-anchor="middle">${esc(t)}</text>` +
      `<text x="${x + nw / 2}" y="116" font-size="11" fill="${C.dim}" text-anchor="middle">${esc(s)}</text>`;
    if (k < nodes.length - 1) {
      out += `<path class="flow" d="M${x + nw + 6} 102H${x + nw + gap - 6}" stroke="${C.magenta}" stroke-width="2" stroke-dasharray="6 4" filter="url(#glowS)"/>` +
        `<path d="M${x + nw + gap - 10} 97l6 5l-6 5" fill="none" stroke="${C.magenta}" stroke-width="2"/>`;
    }
  });

  const style = `.flow{animation:flow 1s linear infinite}@keyframes flow{to{stroke-dashoffset:-20}}`;
  const defs = clipPath("win", { h: H, bottom: true });
  const body = `
<g clip-path="url(#win)">
  ${background({ h: H })}
  ${sectionLabel({ no: "06", name: "AUTO_UPDATE", right: `LAST SYNC ${stats.lastDataDate}  //  SOURCE ${String(stats.source || "").toUpperCase()}` })}
  ${out}
  <text x="40" y="160" font-size="11" fill="${C.dim}">AUTH: GITHUB_TOKEN / optional PROFILE_TOKEN repository secret  --  no credentials are stored in this repo</text>
  <text x="40" y="196" font-size="14" fill="${C.green}">$ <tspan fill="${C.text}">exit</tspan></text>
  <text x="40" y="216" font-size="12" fill="${C.dim}">connection to night-city closed. // EOF <tspan class="blink" fill="${C.yellow}">_</tspan></text>
  ${scanOverlay({ h: H })}
</g>
${frame({ h: H, bottom: true })}`;
  return svg({
    h: H,
    style, defs, body,
    title: `${user} profile auto-update pipeline: GitHub Actions cron, fetch, render, commit. Last sync ${stats.lastDataDate}`,
  });
}
