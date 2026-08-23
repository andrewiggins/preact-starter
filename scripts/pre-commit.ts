#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

try {
	// Get list of staged files
	// NUL-delimited paths and argument arrays keep filenames out of shell syntax.
	const output = execFileSync(
		"git",
		["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"],
		{ encoding: "utf-8" },
	);
	const files = output.split("\0").filter(Boolean);

	if (files.length === 0) {
		process.exit(0);
	}

	console.log(`Formatting ${files.length} staged file(s)...`);

	// Run prettier on staged files
	// Using --ignore-unknown so prettier skips files it doesn't support
	const prettierCliPath = fileURLToPath(
		import.meta.resolve("prettier/bin/prettier.cjs"),
	);
	execFileSync(
		process.execPath,
		[prettierCliPath, "--ignore-unknown", "--write", "--", ...files],
		{ stdio: "inherit" },
	);

	// Re-stage the formatted files
	execFileSync("git", ["add", "--", ...files], {
		stdio: "inherit",
	});

	console.log("✓ Files formatted and staged");
	process.exit(0);
} catch (error) {
	console.error("Pre-commit hook failed:", error);
	process.exit(1);
}
