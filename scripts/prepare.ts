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

// Pre-commit hook script - calls our Node.js script for cross-platform compatibility
const preCommitScript = `#!/bin/sh
node --experimental-strip-types ./scripts/pre-commit.ts
`;

// Write pre-commit hook
writeFileSync(preCommitPath, preCommitScript, { encoding: "utf-8" });
chmodSync(preCommitPath, 0o755); // Make executable

console.log("✓ Created pre-commit hook at", preCommitPath);
console.log(
	"Staged files will now be automatically formatted with Prettier before each commit.",
);
