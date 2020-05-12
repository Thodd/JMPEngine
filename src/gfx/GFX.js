import { log, error, fail } from "../utils/Log.js";
import Manifest from "../Manifest.js";
import PerformanceTrace from "../utils/PerformanceTrace.js";

import Buffer from "./Buffer.js";

/**
 * Setup some simple CSS stylings programmatically so we don't need an extra stylesheet.
 */
function setupCSS() {
	const head = document.getElementsByTagName('head')[0];

	const style = document.createElement('style');
	style.type = 'text/css';

	const css = `
		.jmpCanvas {
			position: absolute;

			/*transform: translateZ(0px);*/

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

/**
 * Creates the rendering surface
 */
function setupBuffers(containerDOM) {
	let layerCount = Manifest.get("/layers");
	let w = Manifest.get("/w");
	let h = Manifest.get("/h");
	let scale = Manifest.get("/scale");

	// wrap layers in a div
	let _wrapperDiv = document.createElement("div");
	_wrapperDiv.classList.add("jmpWrapper");
	_wrapperDiv.style.width = w * scale;
	_wrapperDiv.style.height = h * scale;

	for (let i = 0; i < layerCount; i++) {
		let layer = new Buffer(w, h, scale, i);
		_buffers.push(layer);
		_wrapperDiv.appendChild(layer.getCanvas());
	}

	containerDOM.appendChild(_wrapperDiv);

	log("Canvases created.", "GFX");
}

function setupDebugUI() {
	let up = new URLSearchParams(window.location.search);
	if (up.get("debug")) {
		let d = document.createElement("div");
		d.style.fontFamily = "monospace";
		document.body.appendChild(d);
		setInterval(() => {
			d.innerHTML = `
				render-time: ${PerformanceTrace.renderTime.toFixed(2)}ms<br />
				update-time: ${PerformanceTrace.updateTime.toFixed(2)}ms<br />
				draw-calls : ${PerformanceTrace.drawCalls}<br />
				pixelsDrawn: ${PerformanceTrace.pixelsDrawn}
			`;
		}, 500);
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

const _buffers = [];

/**
 * GFX Facade
 */
const GFX = {
	/**
	 * Returns the Renderer instance for the managed Buffer on the given layer.
	 *
	 * @param {integer} i the layer
	 * @returns {Basic|Raw}
	 */
	get: function(i) {
		return _buffers[i].renderer;
	},

	/**
	 * Returns the Buffer on the given layer.
	 *
	 * @param {integer} i the layer
	 */
	getBuffer(i) {
		return _buffers[i];
	},

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
	init: function init(containerID) {
		let containerDOM;

		// check container dom
		if (typeof containerID == "string") {
			containerDOM = document.getElementById(containerID);
		} else if (typeof containerID == "object") {
			// assume we have a dom node already
			containerDOM = containerID;
		}

		if (!containerDOM) {
			fail("Container DOM ID is not valid!", "GFX");
		}

		log("Initializing GFX module ... ", "GFX");

		setupCSS();

		setupBuffers(containerDOM);

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