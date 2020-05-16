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

// gameloop variables
let fps = 60;
let timePerFrame = 1/fps;
let dt = 0;
let last = 0;

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
		// end old screen
		if (currentScreen) {
			currentScreen.end();
		}
		currentScreen = nextScreen;

		// setup phase (GFX setup)
		currentScreen._setup();
		currentScreen.setup();
		currentScreen._initialClear();

		// begin phase (game logic)
		currentScreen.begin();

		nextScreen = null;

		// new performance trace for each screen
		PerformanceTrace.clear();
	}

	// main gameloop implementation is based on the "fixing your timestep" tutorial by "codeincomplete.com"
	// and information taken from the article "Dewitters Gameloop":
	// https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop/
	// https://dewitters.com/dewitters-gameloop/
	let now = window.performance.now();
	dt = dt + Math.min(1, (now - last) / 1000);
	last = now;

	// only do all this if we have a screen set
	if (currentScreen) {
		let dirtyUI = false;
		while(dt > timePerFrame) {
			dt = dt - timePerFrame;

			// update
			PerformanceTrace.start("update");
			currentScreen._update();
			PerformanceTrace.end("update");

			dirtyUI = true;

			resetKeyboard();
		}

		// So the dirty check is a simple variation on the above mentioned tutorial.
		// So why don't we render every frame now (as proposed by codeincomplete)?
		// and interpolate during rendering (as proposed by Koen Witters)?

		// It's based on the following assumptions:
		// - every time we update, we also need to render (depending on the configured FPS)
		// - requestAnimationFrame targets 60fps
		// - The JMP Engine targets full-pixel only
		// - The JMP Engine is a software renderer based on copying pixel buffer data
		//   in a single/sync. JavaScript stack, so render-time should be regarded
		//   with a similar perspective as update-time

		// From my experience, using a dirty check significantly decreases CPU usage and memory consumption.
		// It's also most likely more energy efficient.
		// However, even with full-pixels as a target (no sub-pixels or anti-aliasing), we could still use interpolation for
		// rendering, e.g. a 2px movement during update, could still be rendered as two 1px movements during rendering.
		// While interpolation would smooth out the 30fps mode, we still would need to do much more calculations
		// per loop, and this is noticeable with a high entity count.
		// I saw a noticeable performance decrease with roughly > 5000 entities in my tests.
		if (dirtyUI) {
			// rendering
			PerformanceTrace.resetDrawCounters();
			PerformanceTrace.start("render");
			currentScreen._render(dt);
			PerformanceTrace.end("render");
		}
		PerformanceTrace.finalize();

	}

	// update as fast as the browser sees fit
	requestAnimationFrame(gameloop);
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
	 * Changes the FPS of the gameloop.
	 * Updates are executed at the given rate.
	 */
	set FPS(x) {
		x = x || 60; // 0 is stupid...
		fps = x;
		timePerFrame = 1/x;
	},

	get FPS() {
		return fps;
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
			return window.performance.now() - startTime;
		}
		// resolution in seconds
		return (window.performance.now() - startTime) / 1000;
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

		// kickstart gameloop
		Engine.FPS = Manifest.get("/fps");
		startTime = last = window.performance.now()
		gameloop();
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