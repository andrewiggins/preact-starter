/// <reference types="vitest/config" />
import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
const viteConfig: UserConfig = defineConfig({
	base: "/preact-starter/",
	plugins: [preact()],
	test: {
		projects: [
			{
				test: {
					name: "happy-dom",
					root: "./test",
					environment: "happy-dom",
				},
			},
		],
	},
});
export default viteConfig;
