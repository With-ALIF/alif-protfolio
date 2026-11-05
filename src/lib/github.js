// Server-side GitHub data layer for the homepage snapshot.
//
// All GitHub requests happen on the server. The access token is read from the
// environment and never returned to the client. Only public counters are
// exposed to the client.
import { unstable_cache } from "next/cache";

const API = "https://api.github.com";
const GRAPHQL_API = "https://api.github.com/graphql";
const REVALIDATE_SECONDS = 60 * 60 * 24; // refresh once a day
const MAX_REPO_PAGES = 5;
const DEFAULT_USERNAME = "With-ALIF";


export class GitHubApiError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.name = "GitHubApiError";
    this.code = code;
    this.resetAt = extra.resetAt ?? null;
    this.status = extra.status ?? null;
  }
}

function cleanUsername(value) {
  const username = String(value ?? "").trim();
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/.test(username) ? username : DEFAULT_USERNAME;
}

export function getGitHubUsername() {
  return cleanUsername(process.env.GITHUB_USERNAME);
}

function authHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "alif-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function rateLimitFrom(response) {
  const remainingHeader = response.headers.get("x-ratelimit-remaining");
  const limitHeader = response.headers.get("x-ratelimit-limit");
  const resetHeader = response.headers.get("x-ratelimit-reset");
  const remaining = Number(remainingHeader);
  const limit = Number(limitHeader);
  const reset = Number(resetHeader);
  return {
    remaining: remainingHeader !== null && Number.isFinite(remaining) ? remaining : null,
    limit: limitHeader !== null && Number.isFinite(limit) ? limit : null,
    resetAt: resetHeader !== null && Number.isFinite(reset) ? new Date(reset * 1000).toISOString() : null,
  };
}

async function githubFetch(url, { token, allowAnonymousRetry = true, revalidate = REVALIDATE_SECONDS } = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: authHeaders(token),
      next: { revalidate },
    });
  } catch {
    throw new GitHubApiError("network", "GitHub could not be reached right now.");
  }

  // A stale or revoked token should not take the public profile down with it.
  if (response.status === 401 && token && allowAnonymousRetry) {
    return githubFetch(url, { token: null, allowAnonymousRetry: false, revalidate });
  }

  if (!response.ok) {
    const limit = rateLimitFrom(response);
    if (response.status === 403 || response.status === 429) {
      throw new GitHubApiError("rate-limit", "The GitHub API rate limit has been reached.", {
        resetAt: limit.resetAt,
        status: response.status,
      });
    }
    throw new GitHubApiError("http", "GitHub returned an unexpected response.", {
      status: response.status,
      resetAt: limit.resetAt,
    });
  }

  return { response, rateLimit: rateLimitFrom(response) };
}

async function fetchJson(url, options) {
  const { response, rateLimit } = await githubFetch(url, options);
  let data;
  try {
    data = await response.json();
  } catch {
    throw new GitHubApiError("payload", "GitHub returned unreadable data.");
  }
  return { data, rateLimit };
}

function normalizeUser(raw) {
  return {
    login: raw.login ?? "",
    name: raw.name ?? "",
    avatarUrl: raw.avatar_url ?? "",
    bio: raw.bio ?? "",
    htmlUrl: raw.html_url ?? `https://github.com/${raw.login ?? ""}`,
    company: raw.company ?? "",
    location: raw.location ?? "",
    blog: raw.blog ?? "",
    followers: Number(raw.followers) || 0,
    following: Number(raw.following) || 0,
    publicRepos: Number(raw.public_repos) || 0,
    publicGists: Number(raw.public_gists) || 0,
    createdAt: raw.created_at ?? null,
  };
}

function normalizeRepo(raw) {
  const visibility = raw.visibility === "private" || raw.private ? "private" : "public";
  return {
    id: raw.id,
    name: raw.name ?? "",
    fullName: raw.full_name ?? "",
    description: String(raw.description ?? "").trim(),
    htmlUrl: raw.html_url ?? "",
    homepage: String(raw.homepage ?? "").trim(),
    language: raw.language ?? null,
    languagesUrl: raw.languages_url ?? "",
    stars: Number(raw.stargazers_count) || 0,
    forks: Number(raw.forks_count) || 0,
    watchers: Number(raw.watchers_count) || 0,
    openIssues: Number(raw.open_issues_count) || 0,
    visibility,
    isPrivate: visibility === "private",
    fork: Boolean(raw.fork),
    archived: Boolean(raw.archived),
    topics: Array.isArray(raw.topics) ? raw.topics : [],
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    pushedAt: raw.pushed_at ?? raw.updated_at ?? null,
    size: Number(raw.size) || 0,
  };
}

async function fetchUser(username, token) {
  const { data, rateLimit } = await fetchJson(`${API}/users/${encodeURIComponent(username)}`, { token });
  return { user: normalizeUser(data), rateLimit };
}

async function fetchRepositories(username, token) {
  const all = [];
  let rateLimit = null;

  for (let page = 1; page <= MAX_REPO_PAGES; page += 1) {
    const url =
      `${API}/users/${encodeURIComponent(username)}/repos` +
      `?per_page=100&page=${page}&sort=updated&type=owner`;
    const { data, rateLimit: pageLimit } = await fetchJson(url, { token });
    rateLimit = pageLimit;
    if (!Array.isArray(data)) break;
    all.push(...data.map(normalizeRepo));
    if (data.length < 100) break;
  }

  // `type=owner` still only exposes public data for another user. Filter again
  // so a private repository can never leak into the public page if GitHub ever
  // changes the response shape.
  return {
    repos: all.filter((repo) => !repo.isPrivate && repo.visibility === "public"),
    rateLimit,
  };
}

function levelFromCount(count, max) {
  if (!count) return 0;
  if (!max) return 1;
  return Math.max(1, Math.min(4, Math.ceil((count / max) * 4)));
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function utcDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function normalizeGraphWeeks(rawWeeks) {
  const weeks = [];
  let max = 0;

  for (const week of rawWeeks || []) {
    const days = Array.from({ length: 7 }, () => null);
    for (const day of week.contributionDays || []) {
      const weekday = Number(day.weekday);
      if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) continue;
      max = Math.max(max, Number(day.contributionCount) || 0);
      days[weekday] = {
        date: day.date,
        count: Number(day.contributionCount) || 0,
        level: 0,
      };
    }
    weeks.push(days);
  }

  for (const week of weeks) {
    for (const day of week) {
      if (day) day.level = levelFromCount(day.count, max);
    }
  }

  return weeks;
}

function monthLabels(weeks) {
  const labels = [];
  let previous = null;

  weeks.forEach((week, index) => {
    const first = week.find(Boolean);
    if (!first) {
      labels.push("");
      return;
    }
    const month = utcDate(first.date).getUTCMonth();
    if (month !== previous) {
      labels.push(MONTHS_SHORT[month]);
      previous = month;
    } else {
      labels.push("");
    }
  });

  return labels;
}

async function fetchContributionsGraphQL(username, token, createdAtValue) {
  const now = new Date();
  const from = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, now.getUTCDate(), 23, 59, 59)
  );

  const createdAtDate = createdAtValue ? new Date(createdAtValue) : null;
  const createdAt = createdAtDate && Number.isFinite(createdAtDate.getTime()) ? createdAtDate : null;
  const startYear = createdAt ? createdAt.getUTCFullYear() : now.getUTCFullYear();
  const periods = [];
  for (let year = startYear; year <= now.getUTCFullYear(); year += 1) {
    const start = year === startYear && createdAt ? createdAt : new Date(Date.UTC(year, 0, 1));
    const end =
      year === now.getUTCFullYear()
        ? now
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    periods.push([start, end]);
  }

  const variableDefs = [
    "$login: String!",
    "$from: DateTime!",
    "$to: DateTime!",
    ...periods.flatMap((_, index) => [`$p${index}From: DateTime!`, `$p${index}To: DateTime!`]),
  ].join(", ");

  const periodFields = periods
    .map(
      (_, index) =>
        `p${index}: contributionsCollection(from: $p${index}From, to: $p${index}To) { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } }`
    )
    .join(" ");

  const query = `
    query GitHubProfile(${variableDefs}) {
      user(login: $login) {
        createdAt
        recent: contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                weekday
              }
            }
          }
        }
        ${periodFields}
      }
    }
  `;

  const variables = {
    login: username,
    from: from.toISOString(),
    to: now.toISOString(),
  };
  periods.forEach(([start, end], index) => {
    variables[`p${index}From`] = start.toISOString();
    variables[`p${index}To`] = end.toISOString();
  });

  let graphResponse;
  try {
    graphResponse = await fetch(GRAPHQL_API, {
      method: "POST",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    throw new GitHubApiError("network", "GitHub could not be reached right now.");
  }

  if (!graphResponse.ok) {
    throw new GitHubApiError("graphql", "Contribution data is unavailable.");
  }

  const payload = await graphResponse.json();
  if (payload?.errors?.length || !payload?.data?.user) {
    throw new GitHubApiError("graphql", "Contribution data is unavailable.");
  }

  const user = payload.data.user;
  const recent = user.recent?.contributionCalendar;
  if (!recent) throw new GitHubApiError("graphql", "Contribution data is unavailable.");

  const weeks = normalizeGraphWeeks(recent.weeks);
  if (weeks.length === 0) throw new GitHubApiError("graphql", "Contribution data is unavailable.");

  let allTimeTotal = 0;
  let allTimeActiveDays = 0;
  let allTimeComplete = true;
  periods.forEach((_, index) => {
    const calendar = user[`p${index}`]?.contributionCalendar;
    const total = Number(calendar?.totalContributions);
    const periodWeeks = calendar?.weeks;
    if (!Number.isFinite(total) || !Array.isArray(periodWeeks)) {
      allTimeComplete = false;
      return;
    }
    allTimeTotal += total;

    const periodDays = periodWeeks.flatMap((week) => week?.contributionDays ?? []);
    allTimeActiveDays += periodDays.filter(
      (day) => Number(day.contributionCount) > 0
    ).length;
  });

  return {
    available: true,
    source: "graphql",
    calendar: {
      totalContributions: Number(recent.totalContributions) || 0,
      weeks,
      monthLabels: monthLabels(weeks),
    },
    allTimeTotal: allTimeComplete ? allTimeTotal : null,
    allTimeActiveDays: allTimeComplete ? allTimeActiveDays : null,
    from: dateKey(from),
    to: dateKey(now),
    fetchedFrom: "GitHub GraphQL API",
  };
}

async function fetchContributionsFromHtml(username) {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, now.getUTCDate()));
  const url = `https://github.com/users/${encodeURIComponent(username)}/contributions`;

  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "Mozilla/5.0 (compatible; alif-portfolio)",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  }).catch(() => null);

  if (!response?.ok) {
    throw new GitHubApiError("contributions", "Contribution data is unavailable.");
  }

  const html = await response.text();
  const countsByTooltip = new Map();

  for (const match of html.matchAll(/<tool-tip\b[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g)) {
    const text = match[2].replace(/<[^>]+>/g, " ").trim();
    const countMatch = text.match(/(\d+)\s+contribution/i);
    countsByTooltip.set(match[1], countMatch ? Number(countMatch[1]) : 0);
  }

  const days = [];
  for (const tag of html.matchAll(/<td\b[^>]*>/g)) {
    const value = tag[0];
    const date = value.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    if (!date) continue;
    const id = value.match(/\bid="([^"]+)"/)?.[1];
    const count = id && countsByTooltip.has(id) ? countsByTooltip.get(id) : 0;
    days.push({ date, count });
  }

  const filtered = days
    .filter((day) => {
      const date = utcDate(day.date);
      return date >= from && date <= now;
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  if (filtered.length === 0) {
    throw new GitHubApiError("contributions", "Contribution data is unavailable.");
  }

  const max = Math.max(...filtered.map((day) => day.count), 0);
  const weeksByStart = new Map();

  for (const day of filtered) {
    const date = utcDate(day.date);
    const start = new Date(date);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    const key = dateKey(start);
    if (!weeksByStart.has(key)) weeksByStart.set(key, Array.from({ length: 7 }, () => null));
    const week = weeksByStart.get(key);
    week[date.getUTCDay()] = {
      date: day.date,
      count: day.count,
      level: levelFromCount(day.count, max),
    };
  }

  const weeks = [...weeksByStart.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, week]) => week);

  return {
    available: true,
    source: "html",
    calendar: {
      totalContributions: filtered.reduce((total, day) => total + day.count, 0),
      weeks,
      monthLabels: monthLabels(weeks),
    },
    allTimeTotal: null,
    allTimeActiveDays: null,
    from: dateKey(from),
    to: dateKey(now),
    fetchedFrom: "GitHub public contribution graph",
  };
}

async function fetchContributions(username, token, createdAt) {
  if (token) {
    try {
      return await fetchContributionsGraphQL(username, token, createdAt);
    } catch {
      // Fall through to the public graph so a GraphQL permission/limit issue
      // never produces an invented or empty-looking chart.
    }
  }

  try {
    return await fetchContributionsFromHtml(username);
  } catch {
    return { available: false, source: null };
  }
}

function publicError(error) {
  if (error instanceof GitHubApiError) {
    return {
      code: error.code,
      message: error.message,
      resetAt: error.resetAt,
    };
  }
  return {
    code: "unknown",
    message: "GitHub data could not be loaded right now.",
    resetAt: null,
  };
}

// Homepage snapshot: public profile counters only. It deliberately skips the
// repository detail payload.
async function loadGitHubStats() {
  const username = getGitHubUsername();
  const token = String(process.env.GITHUB_TOKEN ?? "").trim();
  const profileUrl = `https://github.com/${username}`;
  const fetchedAt = new Date().toISOString();

  const [userResult, reposResult] = await Promise.allSettled([
    fetchUser(username, token),
    fetchRepositories(username, token),
  ]);

  if (userResult.status === "rejected") {
    return {
      ok: false,
      username,
      profileUrl,
      fetchedAt,
      error: publicError(userResult.reason),
    };
  }

  const user = userResult.value.user;
  const repos = reposResult.status === "fulfilled" ? reposResult.value.repos : [];
  const hasRepositoryData = reposResult.status === "fulfilled";
  const publicRepos = repos.filter((repo) => !repo.isPrivate);

  const contributions = await fetchContributions(username, token, user.createdAt).catch(() => null);
  const totalContributions = contributions
    ? contributions.allTimeTotal ?? contributions.calendar.totalContributions
    : null;
  const activeDays = contributions?.allTimeActiveDays ?? null;

  return {
    ok: true,
    username,
    profileUrl,
    fetchedAt,
    stats: {
      publicRepositories: user.publicRepos || publicRepos.length,
      totalStars: hasRepositoryData
        ? publicRepos.reduce((total, repo) => total + repo.stars, 0)
        : null,
      followers: user.followers,
      following: user.following,
      totalForks: hasRepositoryData
        ? publicRepos.reduce((total, repo) => total + repo.forks, 0)
        : null,
      totalContributions,
      activeDays,
      memberSince: user.createdAt ?? null,
      contributionLabel: contributions
        ? contributions.allTimeTotal !== null
          ? "All time"
          : "Last 6 months"
        : null,
    },
  };
}

export const getGitHubStats = unstable_cache(loadGitHubStats, ["github-home-stats-v3"], {
  revalidate: 86400,
});
