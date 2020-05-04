import domReady from "./utils/domReady.js";
import { log } from "./utils/Log.js";
import PerformanceTrace from "./utils/PerformanceTrace.js";
import Manifest from "./Manifest.js";
import AssetLoader from "./assets/AssetLoader.js";
import GFX from "./gfx/GFX.js";
import Fonts from "./gfx/Fonts.js";
import Grid from "./gfx/Grid.js";
import Keyboard from "./input/Keyboard.js";
import Screen from "./game/Screen.js";
import IntroScreen from "./game/intro/IntroScreen.js";

let startTime = 0;

let resetKeyboard = null;

// screen change handling
let currentScreen = null;
let nextScreen = null;

/**
 * The game loop.
 * Takes care of:
 * 1. Updating the currently activated Screen
 * 2. Rendering the currently activated Screen
 * 3. Switching Screens and calling lifecycle Hooks
 */
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
		// resets the performance tracking at the beginning of the frame
		PerformanceTrace.reset();

		// update
		PerformanceTrace.start("update");
		currentScreen.update();
		PerformanceTrace.end("update");

		// rendering
		PerformanceTrace.start("render");
		currentScreen.render();
		PerformanceTrace.end("render");

		PerformanceTrace.finalize();

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
function getIntroScreen() {
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
	 * Returns the passed time in (milli)seconds since the start of the Engine.
	 * @param {string} [res] the optional timer resolution, "ms" = milliseconds
	 */
	now: (res) => {
		// resolution in milliseconds
		if (res == "ms") {
			return Date.now() - startTime;
		}
		// resolution in seconds
		return (Date.now() - startTime) / 1000;
	},

	/**
	 * Starts the Engine.
	 * @param {object} config
	 * @param {string} config.placeAt the ID of the DOM-Element in which the Engine should render
	 * @param {string} config.manifest the manifest, which will be used for starting the Engine.
	 *                                        Either a URL pointing to a json file, or an object with
	 *                                        the static manifest.
	 * @returns {Promise} resolves once the Engine is fully started and Game code can be executed.
	 */
	async start({ placeAt, manifest }) {
		log("Starting Engine. Waiting for DOM ...", "Engine");
		await domReady();

		// retrieve manifest
		await Manifest.init(manifest);

		// GFX init creates all canvases upfront
		GFX.init(placeAt);

		// we wait for the "load" of the default font (and implicitly merge it into the Manifest)
		// this way we can access simple font rendering before the rest of the assets are loaded
		await AssetLoader.load({
			"fonts": {
				"font0": Fonts.DEFAULT_JMP_FONT0
			}
		});

		// TODO: refactor grid into Tilemap class
		Grid.init();

		resetKeyboard = Keyboard.init();

		startTime = Date.now();

		// kickstart gameloop
		gameloop();
		log("Started.", "Engine");

		// Now we do some parallel stuff while the intro screen is showing.
		// All of which involves additional resource requests:
		//   1. show the intro screen, since the gameloop is already running we can see stuff on screen
		//   2. loading the manifest defined assets
		//   3. loading the start screen class
		let parallel = [];

		// show intro screen (instantly resolves if skipped via manifest configuration)
		parallel.push(getIntroScreen());

		// the AssetLoader will enhance the _manifestObject with the loaded resources
		parallel.push(AssetLoader.load(Manifest.get("/assets")));

		// import StartScreen class module (defaults to the Screen class)
		parallel.push(getStartScreenClass());

		// after the intro is done and all assets are loaded we activate an instance of the defined start screen class
		return Promise.all(parallel).then((results) => {
			let startScreenClass = results[2];

			Engine.screen = new startScreenClass();
		});
	}
};

export default Engine;