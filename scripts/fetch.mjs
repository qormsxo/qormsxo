// Fetches contribution data + profile numbers and stores them as JSON in /data.
//
// Auth (never hard-coded):
//   PROFILE_TOKEN  optional, a fine-grained PAT of the profile owner (counts private contributions)
//   GITHUB_TOKEN   automatically provided by GitHub Actions (public data only)
// Without any token (e.g. local run) the public contribution calendar HTML is used as a fallback.
//
// Failure policy: if a source fails, previously stored JSON is kept. The script only exits
// with an error when there is no usable data at all, so the profile never goes blank.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");
const USER = process.env.PROFILE_USER || process.env.GITHUB_REPOSITORY_OWNER || "qormsxo";
const TOKEN = process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN || "";

const UA = { "User-Agent": `${USER}-profile-readme` };
const iso = (d) => d.toISOString().slice(0, 10);

async function load(name, fallback) {
  try {
    return JSON.parse(await readFile(path.join(DATA, name), "utf8"));
  } catch {
    return fallback;
  }
}

async function save(name, obj) {
  await mkdir(DATA, { recursive: true });
  await writeFile(path.join(DATA, name), JSON.stringify(obj, null, 2) + "\n");
}

function warn(msg) {
  console.warn(`::warning::${msg}`);
}

// ---------------------------------------------------------------- GraphQL

async function graphql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...UA, Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

// contributionsCollection covers at most one year per request, so one aliased field per year.
function yearsQuery(years) {
  const fields = years
    .map(
      (y) => `
    y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") {
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }`,
    )
    .join("");
  return `query($login: String!) { user(login: $login) {${fields}\n  } }`;
}

async function fetchViaGraphql() {
  const head = await graphql(
    `query($login: String!) {
      user(login: $login) {
        createdAt
        followers { totalCount }
        repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
        contributionsCollection { contributionYears }
      }
    }`,
    { login: USER },
  );
  const u = head.user;
  const years = u.contributionsCollection.contributionYears;
  const body = await graphql(yearsQuery(years), { login: USER });

  const days = {};
  let allTime = 0;
  for (const y of years) {
    const cal = body.user[`y${y}`].contributionCalendar;
    allTime += cal.totalContributions;
    for (const w of cal.weeks) for (const d of w.contributionDays) days[d.date] = d.contributionCount;
  }
  return {
    days,
    allTime,
    since: u.createdAt.slice(0, 10),
    repos: u.repositories.totalCount,
    followers: u.followers.totalCount,
    source: "graphql",
  };
}

// ---------------------------------------------------------------- Public HTML fallback

async function fetchViaHtml() {
  const end = new Date();
  const start = new Date(end.getTime() - 370 * 86400000);
  const url = `https://github.com/users/${USER}/contributions?from=${iso(start)}&to=${iso(end)}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`contributions HTML ${res.status}`);
  const html = await res.text();

  const days = {};
  const cells = [...html.matchAll(/<td\b[^>]*>/g)].map((m) => m[0]);
  const tips = new Map();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>\s*([^<]*?)\s*</g)) {
    const n = m[2].match(/^(\d+)\s+contribution/);
    tips.set(m[1], n ? Number(n[1]) : 0);
  }
  for (const c of cells) {
    const date = c.match(/data-date="([\d-]+)"/)?.[1];
    if (!date) continue;
    const id = c.match(/\bid="([^"]+)"/)?.[1];
    const level = Number(c.match(/data-level="(\d)"/)?.[1] ?? 0);
    // tooltip has the exact count; fall back to the level (0-4) when it is missing
    days[date] = tips.has(id) ? tips.get(id) : level;
  }
  if (Object.keys(days).length < 300) throw new Error("contribution calendar could not be parsed");
  const allTime = Object.values(days).reduce((a, b) => a + b, 0);
  return { days, allTime, source: "html" };
}

async function fetchProfile() {
  const res = await fetch(`https://api.github.com/users/${USER}`, {
    headers: { ...UA, ...(TOKEN ? { Authorization: `bearer ${TOKEN}` } : {}) },
  });
  if (!res.ok) throw new Error(`users API ${res.status}`);
  const u = await res.json();
  return { repos: u.public_repos, followers: u.followers, since: u.created_at.slice(0, 10) };
}

// ---------------------------------------------------------------- Stats

function streaks(days, today) {
  let longest = 0;
  let run = 0;
  for (const d of Object.keys(days).sort()) {
    if (d > today) continue;
    run = days[d] > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  const cur = new Date(today + "T00:00:00Z");
  // today may not have contributions yet; the streak can still end yesterday
  if (!days[iso(cur)]) cur.setUTCDate(cur.getUTCDate() - 1);
  while (days[iso(cur)] > 0) {
    current++;
    cur.setUTCDate(cur.getUTCDate() - 1);
  }
  return { current, longest };
}

async function main() {
  const previous = await load("contributions.json", null);
  let got = null;

  if (TOKEN) {
    try {
      got = await fetchViaGraphql();
    } catch (e) {
      warn(`GraphQL fetch failed: ${e.message}`);
    }
  }
  if (!got) {
    try {
      got = await fetchViaHtml();
      try {
        Object.assign(got, await fetchProfile());
      } catch (e) {
        warn(`profile fetch failed: ${e.message}`);
      }
    } catch (e) {
      warn(`HTML fallback failed: ${e.message}`);
    }
  }
  if (!got) {
    if (previous) {
      warn("all sources failed - keeping previous data");
      return;
    }
    console.error("No data source available and no previous data stored.");
    process.exit(1);
  }

  const today = iso(new Date());
  const all = got.days;
  const recentDates = Object.keys(all).filter((d) => d <= today).sort();
  const lastYearStart = iso(new Date(Date.now() - 365 * 86400000));
  const lastYear = recentDates.filter((d) => d > lastYearStart).reduce((s, d) => s + all[d], 0);
  const busiest = recentDates.reduce((m, d) => (all[d] > m.count ? { date: d, count: all[d] } : m), {
    date: "",
    count: 0,
  });
  const { current, longest } = streaks(all, today);

  // only the last ~54 weeks are needed for the city
  const keep = {};
  for (const d of recentDates.filter((d) => d >= iso(new Date(Date.now() - 380 * 86400000)))) keep[d] = all[d];

  const prevStats = (await load("stats.json", {})) || {};
  const stats = {
    user: USER,
    source: got.source,
    lastDataDate: recentDates.at(-1) ?? today,
    lastYear,
    allTime: got.source === "graphql" ? got.allTime : prevStats.allTime ?? null,
    currentStreak: current,
    longestStreak: longest,
    busiest,
    repos: got.repos ?? prevStats.repos ?? null,
    followers: got.followers ?? prevStats.followers ?? null,
    since: got.since ?? prevStats.since ?? null,
  };

  await save("contributions.json", { user: USER, days: keep });
  await save("stats.json", stats);
  console.log(`[fetch] ${stats.source}: ${lastYear} contributions / 365d, streak ${current} (best ${longest})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
