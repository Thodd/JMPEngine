import { log, error, fail } from "../utils/Log.js";
import Manifest from "../assets/Manifest.js";

let _engine;

/**
 * Setup some simple CSS stylings programmatically so we don't need an extra stylesheet.
 */
function setupCSS(containerID) {
	const head = document.getElementsByTagName('head')[0];

	const style = document.createElement('style');
	style.type = 'text/css';

	let w = Manifest.get("/w");
	let h = Manifest.get("/h");
	let scale = Manifest.get("/scale");

	const css = `
		#${containerID} canvas {
			width: ${w * scale}px;
			height: ${h * scale}px;

			image-rendering: pixelated;
			image-rendering: -webkit-crisp-edges;
			image-rendering: -moz-crisp-edges;
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

	log("CSS created.", "GFX");
}

function setupDebugUI() {
	let up = new URLSearchParams(window.location.search);
	if (up.get("debug")) {
		let dbg = document.createElement("div");
		dbg.id = "__debugUI";
		dbg.innerHTML = "<div id='__debugUI_stats'></div>";
		document.body.appendChild(dbg);

		let entities = document.createElement("div");
		entities.style.fontFamily = "monospace";
		setInterval(() => {
			entities.innerHTML = `entities: ${_engine.screen.getEntities().length}`;
		}, 500);
		dbg.appendChild(entities);

	}
}

// "Arne 16" palette
// e.g.: https://lospec.com/palette-list/arne-16
const palette = [
	// black, dark brown, red, pink
	"#000000", "#493c2b", "#be2633", "#e06f8b",
	// gray, light brown, orange, yellow
	"#9d9d9d", "#a46422", "#eb8931", "#f7e26b",
	// white, dark blue, steel blue, dark green
	"#ffffff", "#1b2632", "#2f484e", "#44891a",
	// grass green, blue, sky blue, light blue
	"#a3ce27", "#005784", "#31a2f2", "#b2dcef"
];

/**
 * GFX Facade
 */
const GFX = {
	/**
	 * Returns the color at index 'i' in the defined palette.
	 * The index 'i' is looped in the available range of colors in the palette.
	 * @param {integer|undefined} i the color index. If undefined, the palette array is returned
	 */
	pal: function(i) {
		if (i == undefined) {
			return palette;
		}
		return palette[i % palette.length];
	},

	/**
	 * Initialization function.
	 * Only called once.
	 * Will be deleted afterwards.
	 */
	init: function init(containerID, engine) {
		let containerDOM;

		_engine = engine;

		// check container dom
		if (typeof containerID == "string") {
			containerDOM = document.getElementById(containerID);
		} else if (typeof containerID == "object") {
			// assume we have a dom node already
			containerDOM = containerID;
			containerID = containerDOM.id;
		}

		if (!containerDOM) {
			fail("Container DOM ID is not valid!", "GFX");
		}

		log("Initializing GFX module ... ", "GFX");

		// @PIXI: add view to the container DOM
		containerDOM.appendChild(_engine.getPixiApp().view);

		setupCSS(containerID);

		setupDebugUI();

		// remove init function, so it can only be called once
		delete GFX.init;
	},

	/**
	 * Returns the width of the GFX module.
	 * Identical to </code>Manifest.get("/w")</code>.
	 */
	get w() {
		return Manifest.get("/w");
	},
	set w(v) {
		error("Screen width can only be set via manifest!", "GFX");
	},

	/**
	 * Returns the height of the GFX module.
	 * Identical to </code>Manifest.get("/h")</code>.
	 */
	get h() {
		return Manifest.get("/h");
	},
	set h(v) {
		error("Screen height can only be set via manifest!", "GFX");
	}
};

export default GFX;