import AssetLoader from "./utils/AssetLoader.js";
import GFX from "./gfx/GFX.js";
import domReady from "./utils/domReady.js";
import loadJSON from "./utils/loadJSON.js";
import { log, warn, fail } from "./utils/Log.js";

let initialized = false;
let startTime = 0;

let _manifestObject = null;

/**
 * Defaults for the Screen.
 */
const DEFAULTS_FOR_MANIFEST = {
	w: 184,
	h: 136,
	scale: 2,
	layers: 8,
	fps: 60,
	hideCursor: false,
	clearColor: "#000000",
	spritesheets: {},
	fonts: {}
};

const gameloop = () => {
	if (Engine.world) {
		Engine.world.update();
		Engine.world.render();
	}
	window.requestAnimationFrame(gameloop);
};

const Engine = {

	world: null,

	now: () => {
		return (Date.now() - startTime) / 1000;
	},

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
				} else if (!manifest) {
					log("No manifest given. Using Engine defaults.", "Engine");
				} else {
					fail(`Manifest ${manifest} is invalid! Only string and object values are supported.`, "Engine");
				}

				// assign good default values for the manifest, no matter from what source we got it
				_manifestObject = Object.assign(DEFAULTS_FOR_MANIFEST, _manifestObject);

				await AssetLoader.load(_manifestObject);

				// initialize graphics module
				GFX.init(placeAt, _manifestObject);

				startTime = Date.now();

				// kickstart gameloop
				gameloop();

				initialized = true;

				log("Started.", "Engine");
			});
		} else {
			warn("Already initialized!", "Engine");
			return initialized;
		}

		return initialized;
	}

}

export default Engine;