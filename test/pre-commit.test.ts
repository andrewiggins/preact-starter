// @vitest-environment node
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = fileURLToPath(
	new URL("./bin.js", import.meta.resolve("nano-staged")),
);
const config = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))[
	"nano-staged"
];

// Do not let a parent Git process redirect these tests to the real index.
const env = Object.fromEntries(
	Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
);
const pathKey =
	Object.keys(env).find((key) => key.toLowerCase() === "path") ?? "PATH";
env[pathKey] =
	`${join(root, "node_modules", ".bin")}${delimiter}${env[pathKey] ?? ""}`;
env.CI = "true";

let repo: string;

function git(...args: string[]): string {
	return execFileSync("git", args, { cwd: repo, env, encoding: "utf8" });
}

function write(path: string, content: string): void {
	writeFileSync(join(repo, path), content);
}

function runHook(): ReturnType<typeof spawnSync> {
	return spawnSync(process.execPath, [cli, "--quiet"], {
		cwd: repo,
		env,
		encoding: "utf8",
		timeout: 15_000,
	});
}

describe("pre-commit formatting", () => {
	beforeEach(() => {
		repo = mkdtempSync(join(tmpdir(), "preact-pre-commit-"));
		git("init", "-q");
		git("config", "user.name", "Hook test");
		git("config", "user.email", "hook-test@example.invalid");
		git("config", "core.hooksPath", join(repo, "no-hooks"));
		git("config", "commit.gpgsign", "false");
		git("config", "core.autocrlf", "false");
		write("package.json", JSON.stringify({ "nano-staged": config }));
		write(
			".prettierignore",
			readFileSync(join(root, ".prettierignore"), "utf8"),
		);
		write("example.ts", "export const value = 0;\n");
		write("pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
		git("add", ".");
		git("commit", "-qm", "Initial fixture");
	});

	afterEach(() => {
		rmSync(repo, { recursive: true, force: true });
	});

	it("formats staged content without staging unstaged edits", () => {
		write("example.ts", "export const value={x:1}\n");
		git("add", "example.ts");
		write(
			"example.ts",
			'export const value={x:1}\nexport const unstaged = "keep private";\n',
		);

		const result = runHook();
		expect(result.status, String(result.stderr)).toBe(0);
		expect(git("show", ":example.ts")).toBe("export const value = { x: 1 };\n");
		expect(readFileSync(join(repo, "example.ts"), "utf8")).toBe(
			'export const value = { x: 1 };\nexport const unstaged = "keep private";\n',
		);
		expect(git("diff", "--cached")).not.toContain("keep private");
		expect(git("diff")).toContain("keep private");
	}, 20_000);

	it("preserves unstaged edits in Prettier-ignored files", () => {
		const staged = "lockfileVersion: '9.0'\nsettings: {}\n";
		write("pnpm-lock.yaml", staged);
		git("add", "pnpm-lock.yaml");
		write("pnpm-lock.yaml", `${staged}unstaged: true\n`);

		const result = runHook();
		expect(result.status, String(result.stderr)).toBe(0);
		expect(git("show", ":pnpm-lock.yaml")).toBe(staged);
		expect(git("diff", "--cached")).not.toContain("unstaged");
		expect(git("diff")).toContain("unstaged: true");
	}, 20_000);

	it("restores the index and working tree after a formatter failure", () => {
		write("a.ts", "export const a={x:1}\n");
		write("z.ts", "export const z = ;\n");
		git("add", "a.ts", "z.ts");
		write("a.ts", 'export const a={x:1}\nexport const unstaged = "keep";\n');
		const stagedBefore = git("diff", "--cached");
		const unstagedBefore = git("diff");

		const result = runHook();
		expect(result.status, String(result.stderr)).toBe(1);
		expect(git("diff", "--cached")).toBe(stagedBefore);
		expect(git("diff")).toBe(unstagedBefore);
	}, 20_000);
});
