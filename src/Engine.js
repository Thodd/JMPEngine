import domReady from "./utils/domReady.js";
import { log, warn } from "./utils/Log.js";
import Manifest from "./Manifest.js";
import AssetLoader from "./utils/AssetLoader.js";
import GFX from "./gfx/GFX.js";
import Fonts from "./gfx/Fonts.js";
import Spritesheets from "./gfx/Spritesheets.js";
import Grid from "./gfx/Grid.js";
import Keyboard from "./input/Keyboard.js";
import IntroScreen from "./intro/IntroScreen.js";

let initialized = false;
let startTime = 0;

let _resetKeyboard = null;

const gameloop = () => {
	if (Engine.screen) {
		Engine.screen.update();
		Engine.screen.render();
		_resetKeyboard();
	}
	window.requestAnimationFrame(gameloop);
};

function loadMainModule() {
	let main = document.createElement("script");
	main.src = Manifest.resolve(Manifest.get("/main"));
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
	 * @param {string|object|undefined} config.manifest the manifest, which will be used for starting the Engine.
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
				await Manifest.init(manifest);

				// GFX init creates all canvases upfront
				GFX.init(placeAt);

				// the AssetLoader will enhance the _manifestObject with the loaded resources
				await AssetLoader.load();

				// assets can only be initialized after the AssetLoader is done
				Spritesheets.init();
				Fonts.init();
				Grid.init();

				_resetKeyboard = Keyboard.init();

				startTime = Date.now();

				log("Started.", "Engine");

				// kickstart gameloop
				gameloop();

				// Engine intro
				let intro;
				if (Manifest.get("/skipIntro")) {
					intro = Promise.resolve();
				} else {
					let is = new IntroScreen();
					Engine.screen = is;
					intro = is.wait();
				}

				// load main module if given
				await intro.then(() => {
					if (Manifest.get("/main")) {
						loadMainModule();
					}
					// resolve with the parsed manifest object
					return Manifest.get();
				});
			})
		} else {
			warn("Already initialized!", "Engine");
			return initialized;
		}

		return initialized;
	}
}

export default Engine;

// debugging shortcut
window.Engine = Engine;