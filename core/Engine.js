import gfx from "../../gfx/GFX.js";
import { log, warn, domReady, loadJSON, fail } from "./Utils.js";

let initialized = false;

let _manifest = null;

const gameloop = () => {
	window.requestAnimationFrame(gameloop);
};

const Engine = {

	// start a new engine instance
	async start({ placeAt, manifest }) {

		if (!initialized) {
			initialized = Promise.resolve().then(async function() {

				log("Starting Engine. Waiting for DOM ...", "Engine");
				await domReady();

				// manifest url is given
				if (typeof manifest === "string") {
					log(`Loading Manifest from '${manifest}' ...`, "Engine");
					_manifest = await loadJSON(manifest);
				} else if (manifest && typeof manifest === "object") {
					_manifest = JSON.parse(JSON.stringify(manifest));
				} else {
					fail(`Manifest ${manifest} is invalid! Only string and object values are supported.`, "Engine");
				}

				gfx.init(placeAt, _manifest);

				// kickstart gameloop
				gameloop();

				initialized = true;

				log(`Started.`, "Engine");
			});
		} else {
			warn("already initialized!", "Engine");
			return initialized;
		}

		return initialized;
	}

}

export default Engine;