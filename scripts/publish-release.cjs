const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const assets = ["main.js", "manifest.json", "styles.css"];
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"),
);
const changelog = fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8");
const tag = process.env.GITHUB_REF_NAME ?? pkg.version;
const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const dryRun = process.argv.includes("--dry-run");

if (tag !== pkg.version || manifest.version !== pkg.version) {
  fail(`tag, package, and manifest versions must all equal ${pkg.version}`);
}
const notes = extractReleaseNotes(changelog, tag);
if (!notes) fail(`CHANGELOG.md has no notes for ${tag}`);
for (const asset of assets) {
  const assetPath = path.join(ROOT, asset);
  if (!fs.existsSync(assetPath) || fs.statSync(assetPath).size === 0) {
    fail(`release asset ${asset} is missing or empty`);
  }
}

if (dryRun) {
  console.log(`Release ${tag} is ready with ${assets.length} assets.`);
  process.exit(0);
}
if (!repository || !token) fail("GitHub release environment is incomplete");

void publishRelease();

async function publishRelease() {
  const releases = await github(`/repos/${repository}/releases?per_page=100`);
  const existing = releases.find((release) => release.tag_name === tag);
  if (existing) fail(`release ${tag} already exists and is immutable`);

  const release = await github(`/repos/${repository}/releases`, {
    method: "POST",
    body: JSON.stringify({
      tag_name: tag,
      name: `Typesetter ${tag}`,
      body: notes,
      draft: true,
      prerelease: false,
    }),
  });
  const uploadBase = release.upload_url.replace("{?name,label}", "");
  for (const asset of assets) {
    const contentType = asset.endsWith(".js")
      ? "text/javascript"
      : asset.endsWith(".json")
        ? "application/json"
        : "text/css";
    const response = await fetch(
      `${uploadBase}?name=${encodeURIComponent(asset)}`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "Content-Type": contentType,
          "User-Agent": "typesetter-release-workflow",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: fs.readFileSync(path.join(ROOT, asset)),
      },
    );
    if (!response.ok) {
      fail(`uploading ${asset} failed: ${response.status} ${await response.text()}`);
    }
  }
  const published = await github(`/repos/${repository}/releases/${release.id}`, {
    method: "PATCH",
    body: JSON.stringify({ draft: false }),
  });
  console.log(`Published Typesetter ${tag}: ${published.html_url}`);
}

async function github(endpoint, options = {}) {
  const { allowNotFound = false, ...requestOptions } = options;
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...requestOptions,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "typesetter-release-workflow",
      "X-GitHub-Api-Version": "2022-11-28",
      ...requestOptions.headers,
    },
  });
  if (allowNotFound && response.status === 404) return null;
  if (!response.ok) {
    fail(`GitHub API request failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function extractReleaseNotes(text, version) {
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(
    `^## \\[${escaped}\\](?: - \\d{4}-\\d{2}-\\d{2})?\\s*$`,
    "m",
  );
  const match = heading.exec(text);
  if (!match) return "";
  const remainder = text.slice(match.index + match[0].length);
  const nextHeading = remainder.search(/^## \[/m);
  return (nextHeading === -1 ? remainder : remainder.slice(0, nextHeading)).trim();
}

function fail(message) {
  console.error(`Release failed: ${message}`);
  process.exit(1);
}
