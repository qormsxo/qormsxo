// Top two sheets of one night sky: a moon, then open sky and a short note.

import { C, esc, svg, clipPath, skyDefs, skyFill, grain } from "./common.mjs";

export function renderHeader({ user }) {
  const H = 200;
  const name = esc(user);
  const stars = [
    [780, 36, 1.2],
    [910, 28, 1.5],
    [840, 118, 1.1],
    [960, 96, 1.4],
    [720, 78, 1],
    [990, 48, 1.1],
  ]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f7f3ec" opacity=".85"/>`)
    .join("");
  const defs = `
  ${clipPath("win", { h: H, top: true })}
  ${skyDefs("sky", 0)}
  <mask id="crescent">
    <circle cx="880" cy="78" r="26" fill="#fff"/>
    <circle cx="892" cy="68" r="22" fill="#000"/>
  </mask>`;
  const body = `
<g clip-path="url(#win)">
  ${skyFill("sky", H)}
  <ellipse cx="180" cy="40" rx="160" ry="22" fill="#c090b0" opacity=".08" filter="url(#soft)"/>
  ${grain(H)}
  <circle cx="880" cy="78" r="58" fill="#f6f1ea" opacity=".16"/>
  <circle cx="880" cy="78" r="26" fill="#f7f3ec" mask="url(#crescent)"/>
  ${stars}
  <text x="64" y="112" font-size="40" font-weight="700" fill="${C.text}">${name}</text>
  <text x="64" y="150" font-size="18" fill="${C.dim}">백엔드 개발자</text>
</g>`;
  return svg({ h: H, title: `${user}, 백엔드 개발자`, defs, body });
}

export function renderIdentity() {
  const H = 160;
  const defs = `
  ${clipPath("win", { h: H })}
  ${skyDefs("sky", 200)}`;
  const body = `
<g clip-path="url(#win)">
  ${skyFill("sky", H)}
  <ellipse cx="720" cy="36" rx="180" ry="20" fill="#e0a8bc" opacity=".08" filter="url(#soft)"/>
  ${grain(H)}
  <text x="64" y="52" font-size="17" fill="${C.text}">Java, Spring Boot, Node.js, TypeScript, NestJS, React.</text>
  <text x="64" y="86" font-size="17" fill="${C.dim}">PostgreSQL, Redis, BullMQ.</text>
  <text x="64" y="128" font-size="17" fill="${C.text}">Interested in AI-assisted development and automation.</text>
</g>`;
  return svg({
    h: H,
    title: "Java, Spring Boot, Node.js, TypeScript, NestJS, React. PostgreSQL, Redis, BullMQ. Interested in AI-assisted development and automation.",
    defs,
    body,
  });
}
