#!/usr/bin/env node
import { writeFileSync, chmodSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const gitHooksDir = ".git/hooks";
const preCommitPath = join(gitHooksDir, "pre-commit");

// Ensure hooks directory exists
try {
	mkdirSync(gitHooksDir, { recursive: true });
} catch (err) {
	// Directory already exists, ignore
}

// Nano-staged handles formatting, staging, and preserving unstaged changes.
const preCommitScript = `#!/bin/sh
pnpm exec nano-staged
`;

// Write pre-commit hook
writeFileSync(preCommitPath, preCommitScript, { encoding: "utf-8" });
chmodSync(preCommitPath, 0o755); // Make executable

console.log("✓ Created pre-commit hook at", preCommitPath);
console.log(
	"Staged files will now be automatically formatted with Prettier before each commit.",
);
