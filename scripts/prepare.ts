#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
	writeFileSync,
	chmodSync,
	mkdirSync,
	lstatSync,
	readFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
// Git resolves shared worktree hooks and any configured core.hooksPath.
const gitHooksDir = execFileSync(
	"git",
	["rev-parse", "--path-format=absolute", "--git-path", "hooks"],
	{ cwd: root, encoding: "utf-8" },
).replace(/\r?\n$/, "");
const preCommitPath = join(gitHooksDir, "pre-commit");
const managedHeader =
	"#!/bin/sh\n# Managed by preact-starter (scripts/prepare.ts).\n";

// Keep commands relative to the committing worktree, not the installing checkout.
const preCommitScript = `${managedHeader}pnpm exec nano-staged\n`;

// Recognize this project's hooks from before the ownership marker was added.
const legacyHooks = new Set([
	"#!/bin/sh\npnpm exec nano-staged\n",
	"#!/bin/sh\nnode --experimental-strip-types ./scripts/pre-commit.ts\n",
]);
const existingHook = lstatSync(preCommitPath, { throwIfNoEntry: false });
if (existingHook) {
	if (!existingHook.isFile()) {
		throw new Error(
			`Refusing to replace a non-regular hook at ${preCommitPath}`,
		);
	}
	const contents = readFileSync(preCommitPath, "utf-8").replace(/\r\n/g, "\n");
	if (!contents.startsWith(managedHeader) && !legacyHooks.has(contents)) {
		throw new Error(
			`Refusing to overwrite an unmanaged hook at ${preCommitPath}. ` +
				"Move it aside and rerun 'pnpm run prepare' to install this project's hook.",
		);
	}
}

// Filesystem errors must fail installation rather than being silently ignored.
mkdirSync(gitHooksDir, { recursive: true });
writeFileSync(preCommitPath, preCommitScript, {
	encoding: "utf-8",
	flag: existingHook ? "w" : "wx",
});
chmodSync(preCommitPath, 0o755); // Make executable

console.log("✓ Created pre-commit hook at", preCommitPath);
console.log(
	"Staged files will now be automatically formatted with Prettier before each commit.",
);
