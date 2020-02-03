const nodeResolve = require("@rollup/plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const babel = require("rollup-plugin-babel");

/**
 * @typedef {"development" | "production"} Environment
 * @param {string} outputDir
 * @param {string} input
 * @param {boolean} minify
 * @param {(environment: Environment) => any[]} customPlugins
 * @param {Environment} [environment = "production"]
 */
function generateConfig(
	outputDir,
	input,
	minify,
	customPlugins,
	environment = "production"
) {
	const extension = minify ? ".min.js" : ".js";

	// @ts-ignore
	let plugins = [
		...customPlugins(environment),
		nodeResolve({
			extensions: [".mjs", ".js", ".jsx", ".json", ".node"]
		})
	];

	if (minify) {
		plugins.push(terser());
	}

	return {
		input,
		output: {
			dir: outputDir,
			format: "iife",
			compact: minify,
			entryFileNames: `[name]${extension}`,
			chunkFileNames: `[name]-[hash]${extension}`
		},
		plugins,
		watch: {
			clearScreen: false
		}
	};
}

module.exports = generateConfig("dist", "src/index.js", false, () => [
	babel({ exclude: /node_modules/ })
]);
