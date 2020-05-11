import { log, error, fail } from "../utils/Log.js";
import Manifest from "../Manifest.js";
import PerformanceTrace from "../utils/PerformanceTrace.js";

import Basic from "./renderer/Basic.js";
import Raw from "./renderer/Raw.js";

class Buffer {
	constructor(w, h, scale, depth="offscreen") {
		this.width = w;
		this.height = h;
		this.scale = scale;
		this.depth = depth;

		// create canvas & context
		this._canvasDOM = document.createElement("canvas");
		this._canvasDOM.classList.add("jmpCanvas");
		this._canvasDOM.style.cursor = Manifest.get("/hideCursor") ? "none" : "";

		this._ctx = this._canvasDOM.getContext("2d");
		this._ctx.imageSmoothingEnabled = false;
		this._ctx._depth = depth;

		// the style of the canvas scales it to the given scale factor
		this._canvasDOM.style.width = w * scale;
		this._canvasDOM.style.height = h * scale;

		// the canvas itself however has a fixed width and height
		this._canvasDOM.width = this.width;
		this._canvasDOM.height = this.height;

		// create renderer instances
		this._renderers = {
			"BASIC": new Basic(this, Manifest.get()),
			"RAW"  : new Raw(this, Manifest.get())
		};

		// default renderer is "Basic"
		this.setRenderMode(GFX.RenderModes.BASIC);
	}

	setRenderMode(r) {
		if (!GFX.RenderModes[r]) {
			fail(`Unknown render mode: ${r}.`, "GFX");
		}
		this.renderMode = r;
		this.renderer = this._renderers[r];
	}

	getRenderMode() {
		return this.renderMode;
	}

	getCanvas() {
		return this._canvasDOM;
	}

	getContext() {
		return this._ctx;
	}
}

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
	 * Returns the Buffer for the given layer.
	 *
	 * @param {integer} i the layer of the Buffer
	 * @returns {Buffer}
	 */
	get: function(i) {
		return _buffers[i].renderer;
	},

	/**
	 * Returns the Canvas DOM Element for the given layer.
	 * @param {integer} i layer
	 */
	getCanvas: function(i) {
		return _buffers[i]._canvasDOM;
	},

	/**
	 * Returns the 2d Context for the given layer.
	 * @param {integer} i layer
	 */
	getContext: function(i) {
		return _buffers[i]._ctx;
	},

	/**
	 * Changes the RenderMode for the given layer.
	 *
	 * <b>Beware</b>:
	 * Changing the RenderMode mid frame might lead to unexpected results.
	 * It is recommended to change the RenderMode in the <code>Screen</code> constructor
	 * or during the <code>begin</code> event of the Screen.
	 *
	 * @param {integer} i layer
	 * @param {GFX.RenderModes} r the new RenderMode
	 */
	setRenderMode(i, r) {
		if (!GFX.RenderModes[r]) {
			fail(`Unknown render mode: ${r}.`, "GFX");
		}
		_buffers[i].setRenderMode(r);
	},

	/**
	 * Retrieves the RenderMode for the given layer.
	 * @param {integer} i layer
	 */
	getRenderMode(i) {
		return _buffers[i].getRenderMode();
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

		// debugging
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
	},


	/**
	 * Creates an offscreen <code>Buffer</code> instance, which supports the complete Buffer API.
	 * Can be used to (pre-)render graphics to a separate canvas.
	 *
	 * The <code>Buffer#renderOffscreenBuffer</code> method allows to render
	 * such an offscreen Buffer to the Screen.
	 *
	 * The backbuffer itsef is not scaled!
	 * But it will be rendered scaled according to the initial scaling factor of the game screen.
	 * @returns {Buffer} the newly created offscreen buffer
	 */
	createOffscreenBuffer(w, h, renderMode=GFX.RenderModes.BASIC) {
		let b = new Buffer(w, h, 1);
		b.setRenderMode(renderMode);
		return b;
	},

	/**
	 * The List of available render modes:
	 * - Basic  (native canvas draw calls)
	 * - Raw    (pixelbuffering)
	 */
	RenderModes: {
		"BASIC": "BASIC",
		"RAW"  : "RAW"
	}
};

export default GFX;