import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import process from "node:process";

const readmePath = new URL("../profile/README.md", import.meta.url);
const assetPath = new URL(
  "../profile/assets/readme-header.png",
  import.meta.url,
);
const approvedHeaderDigest =
  "98766a10d5ada728a8f939367c571f4fb3ecb82a907028f904c76b1a97fb18a7";
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const requiredText = [
  "Runzivo is building fast, secure, scalable CI/CD compute and managed runners for software teams. V1 starts with Linux x64 runners for GitHub Actions.",
  "Faster CI. Less waiting.",
  "**Planned Early Access:** Email [run@runzivo.dev](mailto:run@runzivo.dev) to request access. After approval, install the Runzivo GitHub App for selected repositories, then change a job to `runs-on: runzivo-linux-x64`.",
  "runs-on: runzivo-linux-x64",
  "run@runzivo.dev",
];
const rejectedText = [
  "10x",
  "enterprise-grade",
  "GitLab",
  "macOS",
  "Apple Silicon",
  "ARM",
  "benchmark",
  "https://runzivo.dev",
  "https://x.com/runzivo",
  "https://www.linkedin.com/company/runzivo",
  "https://www.youtube.com/@runzivo",
  "support@runzivo.dev",
  "security@runzivo.dev",
  "hello@runzivo.dev",
  "ZSoftly Cloud Platform",
  "## Links",
  "## Contact",
  "## Planned V1 Early Access",
  "```yaml",
  "actions/checkout",
  "npm test",
];

await Promise.all([access(readmePath), access(assetPath)]);

const [readme, header, headerMetadata] = await Promise.all([
  readFile(readmePath, "utf8"),
  readFile(assetPath),
  stat(assetPath),
]);
const missing = requiredText.filter((text) => !readme.includes(text));
const rejected = rejectedText.filter((text) =>
  readme.toLowerCase().includes(text.toLowerCase()),
);

if (!readme.includes("assets/readme-header.png")) {
  missing.push("relative header asset reference");
}

if (headerMetadata.size === 0) {
  throw new Error("Header asset is empty.");
}

if (!header.subarray(0, pngSignature.length).equals(pngSignature)) {
  throw new Error("Header asset does not have a valid PNG signature.");
}

if (
  header.length < 24 ||
  header.readUInt32BE(8) !== 13 ||
  header.subarray(12, 16).toString() !== "IHDR"
) {
  throw new Error("Header asset is missing the PNG IHDR chunk.");
}

const width = header.readUInt32BE(16);
const height = header.readUInt32BE(20);

if (width !== 1280 || height !== 320) {
  throw new Error(
    `Header asset dimensions must be 1280x320. Found ${width}x${height}.`,
  );
}

const headerDigest = createHash("sha256").update(header).digest("hex");

if (headerDigest !== approvedHeaderDigest) {
  throw new Error(
    `Header asset SHA-256 must be ${approvedHeaderDigest}. Found ${headerDigest}.`,
  );
}

if (missing.length > 0 || rejected.length > 0) {
  const messages = [];

  if (missing.length > 0) {
    messages.push(`Missing required profile content: ${missing.join(", ")}`);
  }

  if (rejected.length > 0) {
    messages.push(`Unapproved profile content: ${rejected.join(", ")}`);
  }

  throw new Error(messages.join("\n"));
}

process.stdout.write("GitHub organization profile checks passed.\n");
