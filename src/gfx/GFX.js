import { log, warn, error, fail } from "../utils/Log.js";
import PerformanceTrace from "../utils/PerformanceTrace.js";
import Manifest from "../Manifest.js";
import Fonts from "./Fonts.js";
import Spritesheets from "./Spritesheets.js";
import ColorTools from "./ColorTools.js";

let _2PI = 2 * Math.PI;

// rendering canvases & contexts
let _canvases = [];
let _contexts = [];

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
function setupCanvases(containerDOM) {
	let canvasDOM, ctx;

	let canvas_scaled_w = Manifest.get("/scale") * Manifest.get("/w");
	let canvas_scaled_h = Manifest.get("/scale") * Manifest.get("/h");

	// wrap layers in a div
	let wrapperDiv = document.createElement("div");
	wrapperDiv.classList.add("jmpWrapper");
	wrapperDiv.style.width = canvas_scaled_w;
	wrapperDiv.style.height = canvas_scaled_h;

	containerDOM.appendChild(wrapperDiv);

	let layers = Manifest.get("/layers");
	for (let i = 0; i < layers; i++) {
		// create canvas & context
		canvasDOM = document.createElement("canvas");
		_canvases.push(canvasDOM);
		canvasDOM.classList.add("jmpCanvas");
		canvasDOM.style.cursor = Manifest.get("/hideCursor") ? "none" : "";

		ctx = canvasDOM.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		_contexts.push(ctx);

		// the style w/h are scaled
		canvasDOM.style.width = canvas_scaled_w;
		canvasDOM.style.height = canvas_scaled_h;

		// the canvas itself has a fixed width
		canvasDOM.width = Manifest.get("/w");
		canvasDOM.height = Manifest.get("/h");

		wrapperDiv.appendChild(canvasDOM);
	}

	log("Canvases created.", "GFX");
}

/**
 * GFX Module API
 */

// to make geometric rendering less blurred
const n = Math.floor;

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
 * Returns the color at index 'i' in the defined palette.
 * The index 'i' is looped in the available range of colors in the palette.
 * @param {integer|undefined} i the color index. If undefined, the palette array is returned
 */
function pal(i) {
	if (i == undefined) {
		return palette;
	}
	return palette[i % palette.length];
}

function alpha(i, v) {
	ctx(i).globalAlpha = v;
}

/**
 * Retrieve the low-level rendering contexts for the DOM canvases.
 * Beware: Tinkering with these objects is for advanced users only!
 */
function ctx(i) {
	if (i == null) {
		return _contexts;
	}
	return _contexts[i || 0];
}

function clear(i, color) {
	if (color) {
		_canvases[i || 0].style.background = color;
	}
	_contexts[i || 0].clearRect(0, 0, manifest.w, manifest.h);

	// if a pixel buffer exists clear it too
	if (_pxBuffers[i]) {
		_pxBuffers[i] = new ImageData(manifest.w, manifest.h);
	}
}

function clear_rect(i, color, x, y, w, h) {
	if (color) {
		_canvases[i || 0].style.background = color;
	}

	// clear everything inside the given rectangle
	// for w/h we default to the screen-size
	_contexts[i || 0].clearRect(x, y, w || manifest.w, h || manifest.h);

	// TODO: pixel buffers don't work with clearing a rectangle right now -> fix
}

function trans(i, x, y) {
	_contexts[i || 0].translate(x, y);
}

function save(i) {
	// save all
	if (i == null) {
		for (let c in _contexts) {
			_contexts[c].save();
		}
	} else {
		// save single ctx
		_contexts[i || 0].save();
	}
}

function restore(i) {
	// restore all
	if (i == null) {
		for (let c in _contexts) {
			_contexts[c].restore();
		}
	} else {
		// restore single ctx
		_contexts[i || 0].restore();
	}
}

// track pixel buffers if needed
let _pxBuffers = [];
function getBuffer(layer) {
	let ctx = _contexts[layer || 0];
	if (!_pxBuffers[layer]) {
		_pxBuffers[layer] = ctx.getImageData(0, 0, manifest.w, manifest.h);
	}
	return _pxBuffers[layer];
}

/**
 * Flush the pixel buffer for the given layer.
 * Only graphics drawn with GFX.px will be flushed.
 *
 * <b>Beware:</b>
 * The px* routines are the lowest level of GFX API.
 * Setting, clearing and flushing pixels might lead to unwanted side-effects during rendering.
 * Go with the subpx() function for a simple pixel rendering if possible.
 *
 * @param {*} layer
 */
function pxFlush(layer) {
	if (_pxBuffers[layer]) {
		let ctx = _contexts[layer || 0];
		ctx.putImageData(_pxBuffers[layer], 0, 0);

		PerformanceTrace.drawCalls++;
	}
}

/**
 * Renders a Pixel of the given color at coordinates (x,y).
 *
 * <b>Beware:</b>
 * The px* routines are the lowest level of GFX API.
 * Setting, clearing and flushing pixels might lead to unwanted side-effects during rendering.
 * Go with the subpx() function for a simple pixel rendering if possible.
 *
 * @param {integer} x
 * @param {integer} y
 * @param {string} color CSS-color string
 * @param {integer} layer the layer on which the pixel should be set
 */
function px(x, y, color, layer) {
	let d = getBuffer(layer);
	let c = ColorTools.parseColorString(color);
	let off = 4 * (y * d.width + x);
	d.data[off + 0] = c.r;
	d.data[off + 1] = c.g;
	d.data[off + 2] = c.b;
	d.data[off + 3] = (c.a != undefined) || 255;
}

/**
 * Clears the pixel at position (x,y).
 *
 * <b>Beware:</b>
 * The px* routines are the lowest level of GFX API.
 * Setting, clearing and flushing pixels might lead to unwanted side-effects during rendering.
 * Go with the subpx() function for a simple pixel rendering if possible.
 *
 * @param {integer} x
 * @param {integer} y
 * @param {integer} layer
 */
function pxClear(x, y, layer){
	px(x, y, "rgba(0,0,0,0)", layer);
}

/**
 * Renders an antialiased sub-pixel of the given color at coordinates (x,y).
 * @param {*} x
 * @param {*} y
 * @param {*} color CSS-color string (actual color value depends on the browsers sub-pixel rendering algorithm)
 * @param {*} layer the layer on which the pixel should be set
 */
function subpx(x, y, color, layer) {
	rectf(x, y, 1, 1, color, layer);
}

function rect(x, y, w, h, color, layer) {
	let ctx = _contexts[layer || 0];
	ctx.beginPath();
	ctx.strokeStyle = color || ctx.strokeStyle;
	ctx.strokeRect(n(x), n(y), w, h);
	ctx.stroke();
	ctx.closePath();

	PerformanceTrace.drawCalls++;
}

function rectf(x, y, w, h, color, layer) {
	let ctx = _contexts[layer || 0];
	ctx.fillStyle = color || ctx.fillStyle;
	ctx.fillRect(x, y, w, h);

	PerformanceTrace.drawCalls++;
}

function circ(x, y, r, color, layer) {
	let ctx = _contexts[layer || 0];
	ctx.beginPath();
	ctx.arc(x, y, r, 0, _2PI, false);
	ctx.closePath();
	ctx.strokeStyle = color || ctx.strokeStyle;
	ctx.stroke();

	PerformanceTrace.drawCalls++;
}

function circf(x, y, r, color, layer) {
	let ctx = _contexts[layer || 0];
	ctx.beginPath();
	ctx.arc(x, y, r, 0, _2PI, false);
	ctx.closePath();
	ctx.fillStyle = color || ctx.fillStyle;
	ctx.fill();

	PerformanceTrace.drawCalls++;
}

function tri(x0, y0, x1, y1, x2, y2, color, layer) {
	let ctx = _contexts[layer || 0];
	ctx.beginPath();
	ctx.moveTo(n(x0), n(y0));
	ctx.lineTo(n(x1), n(y1));
	ctx.lineTo(n(x2), n(y2));
	ctx.closePath();
	ctx.strokeStyle = color || ctx.strokeStyle;
	ctx.stroke();

	PerformanceTrace.drawCalls++;
}

function trif(x0, y0, x1, y1, x2, y2, color, layer) {
	let ctx = _contexts[layer || 0];
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	ctx.fillStyle = color || ctx.fillStyle;
	ctx.fill();

	PerformanceTrace.drawCalls++;
}

function line(x0, y0, x1, y1, color, layer) {
	let ctx = _contexts[layer || 0];
	ctx.beginPath();
	ctx.moveTo(n(x0), n(y0));
	ctx.lineTo(n(x1), n(y1));
	ctx.closePath();
	ctx.strokeStyle = color || ctx.strokeStyle;
	ctx.stroke();

	PerformanceTrace.drawCalls++;
}

function spr(sheet, id, x, y, layer, sColor) {
	let ctx = _contexts[layer || 0];
	let sprCanvas = Spritesheets.getCanvasFromSheet(sheet, id, sColor);
	ctx.drawImage(sprCanvas, x || 0, y || 0);

	PerformanceTrace.drawCalls++;
}

function spr_ext(sheet, id, x, y, w, h, layer, color, alpha) {
	let ctx = _contexts[layer || 0];
	let sprCanvas = Spritesheets.getCanvasFromSheet(sheet, id, color);

	let oldAlpha;
	if (alpha !== undefined) {
		oldAlpha = ctx.globalAlpha;
		if (oldAlpha !== alpha) {
			ctx.globalAlpha = alpha;
		}
	}

	ctx.drawImage(
		sprCanvas,
		// take the whole src sprite canvas as a base
		0, // sx
		0, // sy
		sprCanvas.width, // sw
		sprCanvas.height, // sh
		// stretch it if w/h is given
		x || 0,
		y || 0,
		w || sprCanvas.width, // default to canvas width
		h || sprCanvas.height, // default to canvas height
	);

	PerformanceTrace.drawCalls++;

	if (oldAlpha) {
		ctx.globalAlpha = oldAlpha;
	}
}

function grid(id, x, y, layer) {
	let ctx = _contexts[layer || 0];
	let grid = manifest._maps[id];
	if (!grid) {
		fail(`Grid '"${id}' does not exist!`);
	}
	ctx.drawImage(grid.canvas, x, y);

	PerformanceTrace.drawCalls++;
}



/**
 * Renders a single line of text.
 * @param {string} font the font which should be used for rendering, e.g. "font0"
 */
function text(font, x, y, msg, layer, color, useKerning=false) {
	let fontObj = manifest.assets.fonts[font];

	let ctx = _contexts[layer || 0];

	let kerningValueAcc = 0;

	let ml = msg.length;
	for (let i = 0; i < ml; i++) {
		let c = msg[i];

		ctx.drawImage(Fonts.getChar(fontObj, c, color), x + i * fontObj.w + kerningValueAcc, y);

		if (useKerning) {
			// to be a bit more fault tolerant we check for the existance of a kerning tree
			let kerningTree = fontObj._kerningTree;
			if (kerningTree) {
				// we have to check all characters + their look-ahead for kerning values
				let lookahead = msg[i+1];
				if (lookahead != null) {
					if ((kerningTree[c] && kerningTree[c][lookahead] != null)) {
						kerningValueAcc += kerningTree[c][lookahead];
					}
				}
			} else {
				warn(`Kerning for GFX.text(${font}, ...) call was activated, though no kerning data is available for this font.`, "GFX.text");
			}
		}

		PerformanceTrace.drawCalls++;
	}
}

/**
 * Renders multiline texts.
 */
function textm(font, x, y, msg, layer, color, leading=0, useKerning=false) {
	let fontObj = manifest.assets.fonts[font];

	// check for linebreak style
	let lineDelimiter = msg.indexOf("\n\r") >= 0 ? "\n\r" : "\n";
	let lines = msg.split(lineDelimiter);

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		text(font, x, y + (i * fontObj.h) + (i * leading), line, layer, color, useKerning);
	}
}

let initialized = false;
let manifest = null;
let containerDOM = null;

function init(containerID) {

	if (initialized) {
		warn("already initialized!", "GFX");
		return;
	}

	// We still keep a reference on the Manifest object here.
	// We don't want to go through the path-parsing of the Manifest everytime.
	//  [!] The GFX module has to be as performant as possible and the API functions get called
	//  [!] multiple times during each frame.
	// Only the cases which are not called that often use the Manifest API.
	manifest = Manifest.get("/");

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

	setupCanvases(containerDOM);

	initialized = true;
}

/********************************* public API *********************************/
const GFX = {
	// dom based API
	alpha,
	ctx,
	clear,
	clear_rect,
	trans,
	save,
	restore,
	// render API
	pal,
	px,
	pxFlush,
	pxClear,
	subpx,
	rect,
	rectf,
	circ,
	circf,
	tri,
	trif,
	line,
	spr,
	spr_ext,
	grid,
	//mapp,
	text,
	textm,

	// width and height
	get w() {
		return Manifest.get("/w");
	},
	set w(v) {
		error("Screen width can only be set from manifest!", "GFX");
	},
	get h() {
		return Manifest.get("/h");
	},
	set h(v) {
		error("Screen width can only be set from manifest!", "GFX");
	},

	init,

	/**
	 * Retrieve the low-level DOM canvases.
	 * Beware: Tinkering with these objects is for advanced users only!
	 * @return {Canvas[]}
	 */
	get canvases() {
		return _canvases;
	}
};
export default GFX;