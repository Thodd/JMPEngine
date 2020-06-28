import domReady from "./utils/domReady.js";
import { log } from "./utils/Log.js";
import Manifest from "./assets/Manifest.js";
import AssetLoader from "./assets/AssetLoader.js";
import GFX from "./gfx/GFX.js";
import Keyboard from "./input/Keyboard.js";
import Screen from "./game/Screen.js";
import IntroScreen from "./game/intro/IntroScreen.js";

// @Stats: Simple performance tracking
import Stats from "../libs/stats.module.js";

// @PIXI include PIXI.js
import { getPixiApp } from "./utils/PIXIWrapper.js";

let pixiApp;

let startTime = 0;

let resetKeyboard = null;

// screen change handling
let currentScreen = null;
let nextScreen = null;

// timing
let last;

// performance stats
var stats;
function setupStats() {
	stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.getElementById("__debugUI_stats").appendChild( stats.dom );
}

/**
 * The game loop.
 * Takes care of:
 * 1. Updating the currently activated Screen
 * 2. Rendering the currently activated Screen
 * 3. Switching Screens and calling lifecycle Hooks
 */
const gameloop = () => {
	stats.begin();
	// if a new screen is scheduled, we end the currentScreen and begin the nextScreen
	if (nextScreen) {
		// end old screen
		if (currentScreen) {
			currentScreen.end();
		}
		currentScreen = nextScreen;

		// setup phase (GFX setup)
		currentScreen.setup();

		// begin phase (game logic)
		currentScreen.begin();

		// @PIXI: Switch out pixi container for rendering the next screen
		pixiApp.stage = currentScreen._pixiContainer;

		nextScreen = null;
	}

	// only do all this if we have a screen set
	if (currentScreen) {
		currentScreen._update();

		resetKeyboard();
	}
	stats.end();
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

	getPixiApp() {
		return pixiApp;
	},

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
	 * old value!
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
			return last - startTime;
		}
		// resolution in seconds
		return (last - startTime) / 1000;
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

		//@PIXI
		log("Initializing PIXI.js", "Engine");
		pixiApp = getPixiApp({
			width: Manifest.get("/w"),
			height: Manifest.get("/h"),
			backgroundColor: Manifest.get("/bg") || 0x272d37
		});

		// GFX init creates all canvases upfront
		GFX.init(placeAt, this);
		setupStats();

		resetKeyboard = Keyboard.init();

		// take initial timing
		last = window.performance.now();
		startTime = last;

		// kickstart gameloop
		pixiApp.ticker.add(gameloop);

		log("Gameloop started.", "Engine");

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