import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runIfMain } from './run-if-main.mjs';

/**
 * `npm run audit`: `npm audit --audit-level=moderate`, with one honest escape hatch.
 *
 * `npm audit` consults the live advisory database, so a tree that was clean an hour
 * ago can fail with no change in this repository (2026-10-02: GHSA-ch52-4w7c-c8xp on
 * `http-cache-semantics`, reached only through the dev-only SBOM generator, with no
 * patched version published). npm's own remedy was a `--force` major downgrade of the
 * SBOM tool. Instead, an advisory may be allowlisted in `audit-allowlist.json`, and only
 * with a reason, the packages it is accepted for, and an expiry date: an expired or unused
 * entry fails the audit exactly like an unlisted advisory, so the list cannot rot.
 */

const ALLOWLIST_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../audit-allowlist.json',
);
const GHSA_PATTERN = /^GHSA-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}$/u;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const SEVERITY_RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

/**
 * Every advisory the audit report names, with the packages it reaches, deduplicated.
 *
 * @param {{vulnerabilities?: Record<string, {severity?: string, via?: Array<string | {url?: string, severity?: string, title?: string}>}>}} report `npm audit --json`
 * @returns {Array<{advisory: string, severity: string, title: string, packages: string[]}>}
 */
export function advisoriesIn(report) {
  const byId = new Map();
  for (const [packageName, vulnerability] of Object.entries(
    report.vulnerabilities ?? {},
  )) {
    for (const via of vulnerability.via ?? []) {
      if (
        typeof via !== 'object' ||
        via === null ||
        typeof via.url !== 'string'
      )
        continue;
      const advisory = via.url.split('/').pop() ?? '';
      const entry = byId.get(advisory) ?? {
        advisory,
        severity: via.severity ?? 'unknown',
        title: via.title ?? '',
        packages: [],
      };
      if (!entry.packages.includes(packageName))
        entry.packages.push(packageName);
      byId.set(advisory, entry);
    }
  }
  return [...byId.values()];
}

/**
 * Pure verdict: which advisories block, which are accepted, and which allowlist entries
 * are invalid, expired or no longer needed.
 *
 * @param {ReturnType<typeof advisoriesIn>} advisories
 * @param {Array<{advisory: string, packages: string[], reason: string, expires: string}>} allowlist
 * @param {string} today `YYYY-MM-DD`
 * @param {string} level the audit level; advisories below it never block
 * @returns {{blocking: string[], accepted: string[], problems: string[]}}
 */
export function evaluateAudit(
  advisories,
  allowlist,
  today,
  level = 'moderate',
) {
  const problems = [];
  const entries = new Map();
  for (const entry of allowlist) {
    if (!GHSA_PATTERN.test(entry.advisory ?? ''))
      problems.push(`allowlist entry has no GHSA id: ${JSON.stringify(entry)}`);
    if (typeof entry.reason !== 'string' || entry.reason.trim().length < 20)
      problems.push(`${entry.advisory}: reason must say why it is acceptable`);
    if (!Array.isArray(entry.packages) || entry.packages.length === 0)
      problems.push(
        `${entry.advisory}: packages must name the affected packages`,
      );
    if (!DATE_PATTERN.test(entry.expires ?? ''))
      problems.push(`${entry.advisory}: expires must be YYYY-MM-DD`);
    else if (entry.expires < today)
      problems.push(
        `${entry.advisory}: allowlist entry expired on ${entry.expires}`,
      );
    entries.set(entry.advisory, { ...entry, used: false });
  }
  const blocking = [];
  const accepted = [];
  const threshold = SEVERITY_RANK[level] ?? SEVERITY_RANK.moderate;
  for (const advisory of advisories) {
    if (
      (SEVERITY_RANK[advisory.severity] ?? SEVERITY_RANK.critical) < threshold
    )
      continue;
    const entry = entries.get(advisory.advisory);
    if (!entry) {
      blocking.push(
        `${advisory.advisory} (${advisory.severity}) ${advisory.title} via ${advisory.packages.join(', ')}`,
      );
      continue;
    }
    entry.used = true;
    const uncovered = advisory.packages.filter(
      (name) => !entry.packages.includes(name),
    );
    if (uncovered.length > 0) {
      blocking.push(
        `${advisory.advisory} reaches packages the allowlist does not accept: ${uncovered.join(', ')}`,
      );
      continue;
    }
    accepted.push(
      `${advisory.advisory} (${advisory.severity}) accepted until ${entry.expires}: ${entry.reason}`,
    );
  }
  for (const entry of entries.values()) {
    if (!entry.used && GHSA_PATTERN.test(entry.advisory ?? ''))
      problems.push(
        `${entry.advisory}: allowlist entry is no longer needed; remove it`,
      );
  }
  return { blocking, accepted, problems };
}

/**
 * Read and validate the allowlist file.
 *
 * @param {string} [file] the allowlist path
 * @returns {Array<{advisory: string, packages: string[], reason: string, expires: string}>} the entries
 */
export function readAllowlist(file = ALLOWLIST_FILE) {
  const parsed = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(parsed))
    throw new Error('audit-allowlist.json must be an array');
  return parsed;
}

/**
 * Run `npm audit --json` at the given level and parse its report.
 *
 * @param {string} level the npm audit level
 * @returns {Record<string, unknown>} the parsed audit report
 */
export function runNpmAudit(level) {
  const result = spawnSync(
    'npm',
    ['audit', '--json', `--audit-level=${level}`],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  if (!result.stdout)
    throw new Error(
      `npm audit produced no report: ${result.stderr.slice(0, 300)}`,
    );
  return JSON.parse(result.stdout);
}

/**
 * Audit the dependency tree, honouring unexpired allowlist entries.
 *
 * @returns {Promise<void>} resolves when the audit passes; exits non-zero otherwise
 */
export async function main() {
  const level = process.env.NPM_AUDIT_LEVEL ?? 'moderate';
  const today = new Date().toISOString().slice(0, 10);
  const report = runNpmAudit(level);
  const { blocking, accepted, problems } = evaluateAudit(
    advisoriesIn(report),
    readAllowlist(),
    today,
    level,
  );
  for (const line of accepted) console.log(`npm-audit: ${line}`);
  for (const line of problems) console.error(`npm-audit: ${line}`);
  for (const line of blocking) console.error(`npm-audit: BLOCKING ${line}`);
  if (blocking.length > 0 || problems.length > 0) {
    console.error(
      `npm-audit: ${blocking.length} blocking advisory(ies), ${problems.length} allowlist problem(s)`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `npm-audit: no blocking advisories at level ${level} (${accepted.length} accepted by allowlist)`,
  );
}

runIfMain(import.meta, main);
