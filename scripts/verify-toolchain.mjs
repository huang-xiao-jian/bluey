import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function verifyToolchain({
  actualNodeVersion,
  actualUserAgent,
  expectedNodeVersion,
  expectedPackageManager,
}) {
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

  const actualPnpmVersion = actualUserAgent.match(/^pnpm\/([^ ]+)/)?.[1];
  if (actualPnpmVersion !== expectedPnpmVersion) {
    const actualPackageManager =
      (actualPnpmVersion ?? actualUserAgent.split(" ")[0]) || "unknown";
    throw new Error(
      `pnpm ${expectedPnpmVersion} is required; received ${actualPackageManager}`,
    );
  }
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

  verifyToolchain({
    actualNodeVersion: process.version.replace(/^v/, ""),
    actualUserAgent: process.env.npm_config_user_agent ?? "",
    expectedNodeVersion,
    expectedPackageManager: packageJson.packageManager,
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
