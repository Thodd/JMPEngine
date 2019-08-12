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
	if (Engine.screen) {
		Engine.screen.update();
		Engine.screen.render();
	}
	window.requestAnimationFrame(gameloop);
};

const Engine = {

	screen: null,

	/**
	 * Returns the passed time in seconds since
	 * the start of the Engine.
	 */
	now: () => {
		return (Date.now() - startTime) / 1000;
	},

	/**
	 * Starts the Engine.
	 * @param {object} config
	 * @param {string} config.placeAt the ID of the DOM-Element in which the Engine should render
	 * @param {string|object} config.manifest the manifest, which will be used for starting the Engine.
	 *                                        Either a URL pointing to a json file, or an object with
	 *                                        the static manifest.
	 * @returns {Promise} resolves once the Engine is fully started and Game code can be executed.
	 */
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

				// the AssetLoader will enhance the _manifestObject with the loaded resources
				await AssetLoader.load(_manifestObject);

				// initialize graphics module
				GFX.init(placeAt, _manifestObject);

				startTime = Date.now();

				initialized = true;

				log("Started.", "Engine");

				// kickstart gameloop
				gameloop();
			});
		} else {
			warn("Already initialized!", "Engine");
			return initialized;
		}

		return initialized;
	}

}

export default Engine;