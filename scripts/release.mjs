#!/usr/bin/env node
// Bump the project version in package.json (the single version source), then
// create a `release: v<version>` commit and a `v<version>` tag. The push
// itself stays manual — `git push --follow-tags origin master` — so the author
// can review the commit before CI starts publishing.
//
// Usage:
//   node scripts/release.mjs <version>
//   node scripts/release.mjs --dry-run <version>
//   node scripts/release.mjs --force <version>     # skip "must be on master" guard
//
// Designed to be importable from tests: `applyVersionToFiles` is pure I/O on
// in-memory file maps.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(__dirname, "..");

// Pragmatic subset of semver, not the full spec. Accepts MAJOR.MINOR.PATCH
// with an optional `-prerelease` suffix limited to [\w.]. Build metadata
// (`+sha.abc`) and hyphenated prerelease (`-rc-1`) are intentionally
// rejected — npm tag conventions for this package don't use them, and a
// stricter regex catches typos that the full spec would silently allow.
const SEMVER_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-[\w.]+)?$/;

export function normalizeVersion(input) {
  const m = SEMVER_RE.exec(input);
  if (!m) {
    throw new Error(
      `Invalid semver "${input}". Expected MAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH-prerelease (with optional leading "v").`
    );
  }
  return input.replace(/^v/, "");
}

/**
 * Pure transform: takes a map of {relativePath: parsedJson} and a version,
 * returns the same map with versions updated. Throws on shape mismatch so a
 * stale fixture cannot silently drift.
 */
export function applyVersionToFiles(version, files) {
  const v = normalizeVersion(version);

  const pkg = files["package.json"];
  if (!pkg || typeof pkg !== "object") {
    throw new Error("package.json missing or not an object");
  }

  // Spread the input first so any other entries the caller passed survive —
  // only package.json is rewritten. Honors the documented "same map with
  // versions updated" contract even if reused with a broader file set.
  return { ...files, "package.json": { ...pkg, version: v } };
}

function readJson(rel) {
  return JSON.parse(readFileSync(resolve(REPO_ROOT, rel), "utf8"));
}

function writeJson(rel, value) {
  const text = JSON.stringify(value, null, 2) + "\n";
  writeFileSync(resolve(REPO_ROOT, rel), text);
}

function currentBranch() {
  return execSync("git rev-parse --abbrev-ref HEAD", { cwd: REPO_ROOT })
    .toString()
    .trim();
}

function main(argv) {
  const args = argv.slice(2);
  let dryRun = false;
  let force = false;
  const positional = [];
  for (const a of args) {
    if (a === "--dry-run") dryRun = true;
    else if (a === "--force") force = true;
    else if (a.startsWith("--")) {
      console.error(`Unknown flag: ${a}`);
      process.exit(2);
    } else positional.push(a);
  }
  if (positional.length !== 1) {
    console.error("Usage: node scripts/release.mjs [--dry-run] [--force] <version>");
    process.exit(2);
  }
  const version = normalizeVersion(positional[0]);

  const paths = ["package.json"];
  const before = Object.fromEntries(paths.map((p) => [p, readJson(p)]));
  const after = applyVersionToFiles(version, before);

  if (dryRun) {
    console.log(`Dry run — would set version to ${version}:\n`);
    for (const p of paths) {
      const b = JSON.stringify(before[p], null, 2);
      const a = JSON.stringify(after[p], null, 2);
      if (b === a) continue;
      console.log(`--- ${p}`);
      // tiny line-by-line diff
      const bLines = b.split("\n");
      const aLines = a.split("\n");
      const max = Math.max(bLines.length, aLines.length);
      for (let i = 0; i < max; i++) {
        if (bLines[i] !== aLines[i]) {
          if (bLines[i] !== undefined) console.log(`- ${bLines[i]}`);
          if (aLines[i] !== undefined) console.log(`+ ${aLines[i]}`);
        }
      }
      console.log();
    }
    return;
  }

  // Wet run only: enforce master branch and a clean working tree before
  // touching files. (Dry-run is allowed from any branch and ignores tree
  // state — its job is to preview, not to mutate.)
  if (!force) {
    const branch = currentBranch();
    if (branch !== "master") {
      console.error(
        `Refusing to release from branch "${branch}". Switch to master, or pass --force for a rehearsal.`
      );
      process.exit(2);
    }
  }
  const dirty = execSync("git status --porcelain", { cwd: REPO_ROOT })
    .toString()
    .trim();
  if (dirty !== "") {
    console.error(
      "Working tree is not clean. Commit, stash, or discard the changes below before releasing:\n\n" +
        dirty
    );
    process.exit(2);
  }

  for (const p of paths) writeJson(p, after[p]);

  execSync(`git add ${paths.join(" ")}`, { cwd: REPO_ROOT, stdio: "inherit" });
  execSync(`git commit -m "release: v${version}"`, {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });
  // Annotated tag is intentional: `git push --follow-tags` (in the README +
  // CLAUDE.md release recipe) only pushes annotated tags. A plain `git tag X`
  // would create a lightweight tag that the documented push command silently
  // leaves behind on the local machine.
  execSync(`git tag -a v${version} -m "release v${version}"`, {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });

  console.log(`\nReady. Push with:\n\n  git push --follow-tags origin master\n`);
}

const isDirectInvocation = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectInvocation) {
  try {
    main(process.argv);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
