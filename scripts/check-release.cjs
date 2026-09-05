const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
const readText = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const pkg = readJson("package.json");
const lock = readJson("package-lock.json");
const manifest = readJson("manifest.json");
const versions = readJson("versions.json");
const changelog = readText("CHANGELOG.md");
const readme = readText("README.md");
const readmeZh = readText("README.zh-CN.md");
const mainSource = readText("src/main.ts");
const settingsSource = readText("src/settings-tab.ts");
const releaseWorkflow = readText(".github/workflows/release.yml");
const publishScript = readText("scripts/publish-release.cjs");
const errors = [];
const releaseAssets = ["main.js", "manifest.json", "styles.css"];
const releaseBadge =
  "img.shields.io/github/v/release/ichenh/obsidian-typesetter?display_name=tag&sort=semver";

checkEqual("package name", pkg.name, "obsidian-publishing-typography");
checkEqual("package main", pkg.main, "main.js");
checkEqual("manifest id", manifest.id, "obsidian-publishing-typography");
checkEqual("manifest name", manifest.name, "Typesetter");
checkEqual("manifest description", manifest.description, pkg.description);
checkEqual("manifest author", manifest.author, pkg.author);
checkEqual("package-lock name", lock.name, pkg.name);
checkEqual("package-lock root name", lock.packages?.[""]?.name, pkg.name);
checkEqual("package private flag", pkg.private, true);

for (const asset of releaseAssets) {
  const assetPath = path.join(ROOT, asset);
  if (!fs.existsSync(assetPath)) {
    errors.push(`release asset ${asset} is missing`);
  } else if (fs.statSync(assetPath).size === 0) {
    errors.push(`release asset ${asset} is empty`);
  }
  checkIncludes("release workflow asset list", releaseWorkflow, asset);
  checkIncludes("release publisher asset list", publishScript, asset);
}

for (const [label, version] of [
  ["manifest.json", manifest.version],
  ["package-lock.json", lock.version],
  ["package-lock.json root package", lock.packages?.[""]?.version],
]) {
  checkEqual(`${label} version`, version, pkg.version);
}

if (typeof pkg.description !== "string" || pkg.description.length === 0) {
  errors.push("package description must be a non-empty string");
} else if (pkg.description.length > 250) {
  errors.push("package description exceeds Obsidian's 250-character limit");
} else if (/^obsidian\b/iu.test(pkg.description)) {
  errors.push('plugin description must not begin with the redundant word "Obsidian"');
}
if (/\bhotkeys\s*:/u.test(mainSource)) {
  errors.push("plugin commands must not register default hotkeys");
}
if (!/\bgetSettingDefinitions\s*\(/u.test(settingsSource)) {
  errors.push("settings tab must expose Obsidian 1.13 searchable definitions");
}
if (!/\bdisplay\s*\(/u.test(settingsSource)) {
  errors.push("settings tab must retain a pre-1.13 imperative fallback");
}
if (versions[pkg.version] !== manifest.minAppVersion) {
  errors.push(
    `versions.json must map ${pkg.version} to ${manifest.minAppVersion}`,
  );
}
if (
  !new RegExp(
    `^## \\[${escapeRegExp(pkg.version)}\\] - \\d{4}-\\d{2}-\\d{2}$`,
    "m",
  ).test(changelog)
) {
  errors.push(`CHANGELOG.md has no dated section for ${pkg.version}`);
}

checkIncludes("README.md release badge", readme, releaseBadge);
checkIncludes("README.md current release", readme, `Current release: v${pkg.version}`);
checkIncludes("README.zh-CN.md release badge", readmeZh, releaseBadge);
checkIncludes("README.zh-CN.md current release", readmeZh, `当前版本：v${pkg.version}`);
checkIncludes(
  "release workflow publisher",
  releaseWorkflow,
  "node scripts/publish-release.cjs",
);
if (/\bgh\s+release\b/u.test(releaseWorkflow)) {
  errors.push("release workflow must not depend on GitHub CLI");
}

if (process.env.GITHUB_REF_TYPE === "tag") {
  checkEqual("release tag", process.env.GITHUB_REF_NAME ?? "", pkg.version);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`Release check: ${error}`);
  process.exit(1);
}
console.log(`Release metadata is consistent for ${pkg.version}.`);

function checkEqual(label, actual, expected) {
  if (actual !== expected) {
    errors.push(
      `${label} ${JSON.stringify(actual)} does not match ${JSON.stringify(expected)}`,
    );
  }
}

function checkIncludes(label, text, expected) {
  if (!text.includes(expected)) {
    errors.push(`${label} is missing ${JSON.stringify(expected)}`);
  }
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
