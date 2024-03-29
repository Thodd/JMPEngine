import domReady from "../utils/domReady.js";
import { log, error, fail } from "../utils/Log.js";
import DebugMode from "../utils/DebugMode.js";
import Manifest from "../assets/Manifest.js";
import AssetLoader from "../assets/AssetLoader.js";
import BuiltInAssets from "../assets/BuiltInAssets.js";
import Keyboard from "../input/Keyboard.js";
import Screen from "../game/Screen.js";
import IntroScreen from "../game/intro/IntroScreen.js";

const DEFAULT_BG_COLOR = 0x272d37;

// @PIXI include PIXI.js
import { detectPIXI, getPixiApp } from "./PIXIWrapper.js";

let pixiApp;

let startFrameTime = 0;

let resetKeyboard = null;

// screen change handling
let currentScreen = null;
let nextScreen = null;

// timing
let lastFrameTime;

// performance stats
let stats;
async function setupStats() {
	if (DebugMode.enabled) {
		// @Stats: Simple performance tracking
		let StatsModule = await import("../../libs/stats.module.js");
		stats = new StatsModule.default();
		stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.getElementById("__debugUI_stats").appendChild( stats.dom );
	}
}

let _b30Frames = false;
let _skipFrame = true;

/**
 * The game loop.
 * Takes care of:
 * 1. Updating the currently activated Screen
 * 2. Rendering the currently activated Screen
 * 3. Switching Screens and calling lifecycle Hooks
 */
const gameloop = () => {
	// start perf trace
	if (DebugMode.enabled) {
		stats.begin();
	}

	if (_b30Frames) {
		_skipFrame = !_skipFrame;
		if (_skipFrame) {
			return;
		}
	}

	// if a new screen is scheduled, we end the currentScreen and begin the nextScreen
	if (nextScreen) {
		// end old screen
		if (currentScreen) {
			currentScreen.end();
		}
		currentScreen = nextScreen;

		// setup phase
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

	lastFrameTime = window.performance.now();

	// end perf trace
	if (DebugMode.enabled) {
		stats.end();
	}
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

function initDOM(containerID) {
	let containerDOM;
	if (typeof containerID == "string") {
		containerDOM = document.getElementById(containerID);
	} else if (typeof containerID == "object") {
		// assume we have a dom node already
		containerDOM = containerID;
		containerID = containerDOM.id;
	}

	if (!containerDOM) {
		fail("Container DOM ID is not valid!", "Engine");
	}

	// @PIXI: add view to the container DOM
	containerDOM.appendChild(Engine.getPixiApp().view);

	setupCSS(containerID);
	setupDebugUI();
}

/**
 * Setup some simple CSS stylings programmatically so we don't need an extra stylesheet.
 */
function setupCSS(containerID) {
	const head = document.getElementsByTagName('head')[0];

	const style = document.createElement('style');

	let w = Manifest.get("/w");
	let h = Manifest.get("/h");
	let scale = Manifest.get("/scale");

	// concerning the pixelated option:
	// works on all major browsers except Safari, there's a bug report for this: https://bugs.webkit.org/show_bug.cgi?id=193895
	const css = `
		#${containerID} canvas {
			width: ${w * scale}px;
			height: ${h * scale}px;

			image-rendering: optimizeSpeed;
			image-rendering: -moz-crisp-edges;
			image-rendering: -o-crisp-edges;
			image-rendering: -webkit-optimize-contrast;
			image-rendering: optimize-contrast;
			image-rendering: pixelated;
			-ms-interpolation-mode: nearest-neighbor;
		}

		.jmpWrapper {
			/*border-top: 2px solid #000000;
			border-left: 2px solid #000000;
			border-right: 2px solid #ffffff;
			border-bottom: 2px solid #ffffff;*/
		}
	`;

	style.appendChild(document.createTextNode(css));

	head.appendChild(style);

	log("CSS created.", "Engine");
}

/**
 * Setup debug UI if debug flag is set
 */
function setupDebugUI() {
	if (DebugMode.enabled) {

		// find debug placeholder if defined
		let dbg = document.getElementById("__jmp_debugUI");
		if (!dbg) {
			dbg = document.createElement("div");
			dbg.id = "__debugUI";
			document.body.appendChild(dbg);
		}

		// stats
		let statsUI = document.createElement("div");
		statsUI.innerHTML = "<div id='__debugUI_stats'></div>";
		document.body.appendChild(statsUI);

		// engine dbg
		let entities = document.createElement("div");
		setInterval(() => {
			if (Engine.screen) {
				entities.innerHTML = `
				layers: ${Engine.screen._layers.length}<br/>
				total entities: ${Engine.screen.getEntities().length}<br/>
				rendered: ${Engine.screen._entitiesVisible}
				`;
			}
		}, 500);
		dbg.appendChild(entities);

	}
}

/**
 * Engine Singleton
 */
const Engine = {
	/**
	 * Returns the underlying PIXI.js App instance.
	 */
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
	 * Returns the passed time in milliseconds since the start of the Engine.
	 */
	nowMillis() {
		// resolution in milliseconds
		return lastFrameTime - startFrameTime;
	},

	/**
	 * Returns the passed time in seconds since the start of the Engine.
	 */
	nowSeconds() {
		// resolution in seconds
		return (lastFrameTime - startFrameTime) / 1000;
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

		// if PIXI is not globally available we can't proceed :(
		log("Detecting PIXI.js ...", "Engine");
		if (!detectPIXI()) {
			error("Aborted.", "Engine");
			return;
		}

		// retrieve manifest
		await Manifest.init(manifest);

		//@PIXI
		log("Initializing PIXI.js", "Engine");
		pixiApp = getPixiApp({
			width: Manifest.get("/w"),
			height: Manifest.get("/h"),
			backgroundColor: DEFAULT_BG_COLOR
		});

		// DOM, CSS, Debug init
		initDOM(placeAt);

		// performance
		await setupStats();

		// input handlint
		resetKeyboard = Keyboard.init();
		// TODO: mouse support

		// take initial timing
		lastFrameTime = window.performance.now();
		startFrameTime = lastFrameTime;

		// kickstart gameloop
		pixiApp.ticker.add(gameloop);

		log("Gameloop started.", "Engine");

		// preload built-in assets e.g. font0 and font1
		log("Preloading built-in assets ...", "Engine");
		await AssetLoader.load(BuiltInAssets);

		// Now we do some parallel stuff while the intro screen is showing.
		// All of which involves additional resource requests:
		//   1. show the intro screen, since the gameloop is already running we can see stuff on screen
		//   2. loading the game assets defined in the manifest.json
		//   3. loading the start screen class
		let parallel = [];

		// show intro screen (instantly resolves if skipped via manifest configuration)
		parallel.push(getIntroScreen());

		// Now load the game assets...
		// the AssetLoader will enhance the _manifestObject with the loaded resources
		log(`Preloading '${Manifest.get("/title") || "unknown"}' assets ...`, "Engine");
		parallel.push(AssetLoader.load(Manifest.get("/assets")));

		// import StartScreen class module (defaults to the Screen class)
		parallel.push(getStartScreenClass());

		// after the intro is done and all assets are loaded we activate an instance of the defined start screen class
		return Promise.all(parallel).then((results) => {
			// set configured BG Color before showing the StartScreen
			pixiApp.renderer.backgroundColor = Manifest.get("/bg") || DEFAULT_BG_COLOR;

			let startScreenClass = results[2];
			Engine.screen = new startScreenClass();
		});
	}
};

export default Engine;