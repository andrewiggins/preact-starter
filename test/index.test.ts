import { beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("hello world", () => {
	beforeAll(async () => {
		document.body.innerHTML = `<div id="root"></div>`;
		await import("../src/index.tsx");
	});

	it("should pass", () => {
		expect(document.getElementById("root")?.textContent).toBe("Hello World");
	});
});
