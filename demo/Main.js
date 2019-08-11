import Engine from "../src/Engine.js";

(async function() {
	await Engine.start({
		placeAt: "content",
		manifest: "./manifest.json"
	});
}());