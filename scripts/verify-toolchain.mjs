import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function verifyToolchain({
  actualNodeVersion,
  actualUserAgent,
  expectedNodeVersion,
  expectedPackageManager,
  miseNodeVersion,
  misePnpmVersion,
}) {
  if (
    miseNodeVersion !== undefined &&
    miseNodeVersion !== expectedNodeVersion
  ) {
    throw new Error(
      `mise Node.js ${miseNodeVersion} does not match .nvmrc ${expectedNodeVersion}`,
    );
  }

  if (actualNodeVersion !== expectedNodeVersion) {
    throw new Error(
      `Node.js ${expectedNodeVersion} is required; received ${actualNodeVersion}`,
    );
  }

  const expectedPnpmVersion = expectedPackageManager.match(/^pnpm@(.+)$/)?.[1];
  if (!expectedPnpmVersion) {
    throw new Error(
      `packageManager must declare an exact pnpm version; received ${expectedPackageManager}`,
    );
  }

  if (
    misePnpmVersion !== undefined &&
    misePnpmVersion !== expectedPnpmVersion
  ) {
    throw new Error(
      `mise pnpm ${misePnpmVersion} does not match packageManager ${expectedPnpmVersion}`,
    );
  }

  const actualPnpmVersion = actualUserAgent.match(/^pnpm\/([^ ]+)/)?.[1];
  if (actualPnpmVersion !== expectedPnpmVersion) {
    const actualPackageManager =
      (actualPnpmVersion ?? actualUserAgent.split(" ")[0]) || "unknown";
    throw new Error(
      `pnpm ${expectedPnpmVersion} is required; received ${actualPackageManager}`,
    );
  }
}

function readMiseToolVersions(source) {
  const versions = {};
  let inTools = false;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.startsWith("[") && line.endsWith("]")) {
      inTools = line === "[tools]";
      continue;
    }

    if (!inTools || line === "" || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^(node|pnpm)\s*=\s*"([^"]+)"(?:\s*#.*)?$/);
    if (match) {
      versions[match[1]] = match[2];
    }
  }

  if (!versions.node || !versions.pnpm) {
    throw new Error("mise.toml must pin node and pnpm in [tools]");
  }

  return versions;
}

function run() {
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const expectedNodeVersion = readFileSync(
    resolve(repositoryRoot, ".nvmrc"),
    "utf8",
  ).trim();
  const packageJson = JSON.parse(
    readFileSync(resolve(repositoryRoot, "package.json"), "utf8"),
  );
  const miseToolVersions = readMiseToolVersions(
    readFileSync(resolve(repositoryRoot, "mise.toml"), "utf8"),
  );

  verifyToolchain({
    actualNodeVersion: process.version.replace(/^v/, ""),
    actualUserAgent: process.env.npm_config_user_agent ?? "",
    expectedNodeVersion,
    expectedPackageManager: packageJson.packageManager,
    miseNodeVersion: miseToolVersions.node,
    misePnpmVersion: miseToolVersions.pnpm,
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    run();
  } catch (error) {
    console.error(`[toolchain] ${error.message}`);
    process.exitCode = 1;
  }
}
