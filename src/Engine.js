import Manifest from "./Manifest.js";
import AssetLoader from "./utils/AssetLoader.js";
import GFX from "./gfx/GFX.js";
import domReady from "./utils/domReady.js";
import { log, warn } from "./utils/Log.js";
import Keyboard from "./input/Keyboard.js";

let initialized = false;
let startTime = 0;

let _manifestObject = null;

const gameloop = () => {
	if (Engine.screen) {
		Engine.screen.update();
		Engine.screen.render();
		Keyboard._reset();
	}
	window.requestAnimationFrame(gameloop);
};

function loadMainModule() {
	let main = document.createElement("script");
	main.src = Manifest.resolve(_manifestObject.main);
	main.type = "module";
	document.head.appendChild(main);
}

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
				_manifestObject = await Manifest.init(manifest);

				// the AssetLoader will enhance the _manifestObject with the loaded resources
				await AssetLoader.load(_manifestObject);

				GFX.init(placeAt, _manifestObject);

				startTime = Date.now();

				log("Started.", "Engine");

				// kickstart gameloop
				gameloop();

				// load main module if given
				if (_manifestObject.main) {
					loadMainModule();
				}

				// always resolve with the parsed manifest object
				return _manifestObject;
			})
		} else {
			warn("Already initialized!", "Engine");
			return initialized;
		}

		return initialized;
	}

}

export default Engine;