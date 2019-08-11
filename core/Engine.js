import AssetLoader from "./AssetLoader.js";
import GFX from "../../gfx/GFX.js";
import domReady from "../utils/domReady.js";
import loadJSON from "../utils/loadJSON.js";
import { log, warn, fail } from "../utils/Log.js";

let initialized = false;

let _manifestObject = null;

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

				// retrieve manifest
				if (typeof manifest === "string") {
					log(`Loading Manifest from '${manifest}' ...`, "Engine");
					_manifestObject = await loadJSON(manifest);
				} else if (manifest && typeof manifest === "object") {
					log("Using manifest from static object. Cloning manifest ...", "Engine");
					_manifestObject = JSON.parse(JSON.stringify(manifest));
				} else {
					fail(`Manifest ${manifest} is invalid! Only string and object values are supported.`, "Engine");
				}

				await AssetLoader.load(_manifestObject);

				// initialize graphics module
				GFX.init(placeAt, _manifestObject);

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