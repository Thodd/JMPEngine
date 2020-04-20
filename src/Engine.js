import domReady from "./utils/domReady.js";
import { log, warn } from "./utils/Log.js";
import Manifest from "./Manifest.js";
import AssetLoader from "./utils/AssetLoader.js";
import GFX from "./gfx/GFX.js";
import Fonts from "./gfx/Fonts.js";
import Spritesheets from "./gfx/Spritesheets.js";
import Grid from "./gfx/Grid.js";
import Keyboard from "./input/Keyboard.js";
import Screen from "./game/Screen.js";
import IntroScreen from "./intro/IntroScreen.js";

let initialized = false;
let startTime = 0;

let resetKeyboard = null;

// screen change handling
let currentScreen = null;
let nextScreen = null;

const gameloop = () => {

	// if a new screen is scheduled, we end the currentScreen and begin the nextScreen
	if (nextScreen) {
		if (currentScreen) {
			currentScreen.end();
		}
		currentScreen = nextScreen;
		currentScreen._begin();
		currentScreen.begin();

		nextScreen = null;
	}

	if (currentScreen) {
		currentScreen.update();
		currentScreen.render();
		resetKeyboard();
	}

	window.requestAnimationFrame(gameloop);
};

/**
 * Imports the start Screen class defined in the Manifest.
 * Default to the base Screen class if none is given.
 */
async function getStartScreenClass() {
	let startScreen;
	let startScreenUrl = Manifest.get("/startScreen");
	if (startScreenUrl) {
		startScreen = await import(Manifest.resolve(startScreenUrl));
		startScreen = startScreen.default;
	} else {
		startScreen = Screen;
	}
	return startScreen;
}

/**
 * Returns a Promise which allows chaining to the end of the intro screen.
 * Resolves directly if "skipIntro" is set in the manifest.
 */
function getInroScreen() {
	let intro;
	if (Manifest.get("/skipIntro")) {
		intro = Promise.resolve();
	} else {
		let is = new IntroScreen();
		Engine.screen = is;
		intro = is.wait();
	}
	return intro;
}

/**
 * Engine Singleton
 */
const Engine = {

	/**
	 * Schedules a new screen for activation.
	 * <b>Beware</b>: The next screen will only be activated at the beginning of the next frame.
	 * @param {Screen} s the next screen which will be activated
	 */
	set screen(s) {
		nextScreen = s;
	},

	/**
	 * Retrieves the <b>currently</b> active screen.
	 *
	 * <b>Beware</b>: Accessing <code>Engine.screen</code> might lead to unexpected results!
	 * If <code>Engine.screen</code> is accessed in the same frame as it was set to a new Screen,
	 * the next scheduled screen is not active yet and <code>Engine.screen</code> will still contain the
	 * old value.
	 */
	get screen() {
		return currentScreen;
	},

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

				resetKeyboard = Keyboard.init();

				startTime = Date.now();

				log("Started.", "Engine");

				// kickstart gameloop
				gameloop();

				// import StartScreen class module (defaults to the Screen class)
				let startScreenClass = await getStartScreenClass();

				// show intro screen (if not skipped)
				await getInroScreen();

				// after the intro we activate an instance of the given startScreen class
				Engine.screen = new startScreenClass();

				// resolve with the parsed manifest object
				return Manifest.get();
			})
		} else {
			warn("Already initialized!", "Engine");
			return initialized;
		}

		return initialized;
	}
};

export default Engine;

// debugging shortcut
window.Engine = Engine;