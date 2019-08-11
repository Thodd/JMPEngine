import Engine from "../core/Engine.js";

(async function() {
	await Engine.start({
		placeAt: "content",
		manifest: "./manifest.json"
	});
}());