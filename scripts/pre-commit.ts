#!/usr/bin/env node
import { execSync } from "node:child_process";

try {
	// Get list of staged files
	const output = execSync("git diff --cached --name-only --diff-filter=ACMR", {
		encoding: "utf-8",
	});

	const files = output.trim().split("\n").filter(Boolean);

	if (files.length === 0) {
		process.exit(0);
	}

	console.log(`Formatting ${files.length} staged file(s)...`);

	// Run prettier on staged files
	// Using --ignore-unknown so prettier skips files it doesn't support
	execSync(
		`npx prettier --ignore-unknown --write ${files.map((f) => `"${f}"`).join(" ")}`,
		{
			stdio: "inherit",
		},
	);

	// Re-stage the formatted files
	execSync(`git add ${files.map((f) => `"${f}"`).join(" ")}`, {
		stdio: "inherit",
	});

	console.log("✓ Files formatted and staged");
	process.exit(0);
} catch (error) {
	console.error("Pre-commit hook failed:", error);
	process.exit(1);
}
