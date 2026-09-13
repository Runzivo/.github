import { readFile } from "node:fs/promises";

const userAgent = process.env.npm_config_user_agent ?? "";

if (!userAgent.startsWith("pnpm/")) {
  throw new Error("This repository uses pnpm. Run pnpm install.");
}

const packageMetadata = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const requiredNodeVersion = packageMetadata.devEngines?.runtime?.version;
const requiredPnpmVersion = packageMetadata.packageManager?.replace(
  /^pnpm@/,
  "",
);
const usedPnpmVersion = /^pnpm\/([^\s]+)/.exec(userAgent)?.[1];
const currentVersion = process.versions.node.split(".").map(Number);

if (
  !requiredNodeVersion ||
  !requiredPnpmVersion ||
  !usedPnpmVersion ||
  !currentVersion.every(Number.isInteger)
) {
  throw new Error(
    "Unable to validate the Node.js version declared in package.json.",
  );
}

if (usedPnpmVersion !== requiredPnpmVersion) {
  throw new Error(
    `This repository requires pnpm ${requiredPnpmVersion}. Found pnpm ${usedPnpmVersion}.`,
  );
}

if (currentVersion.join(".") !== requiredNodeVersion) {
  throw new Error(
    `This repository requires Node.js ${requiredNodeVersion}. Found ${process.versions.node}.`,
  );
}
