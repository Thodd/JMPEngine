import { log, warn, error, fail } from "../utils/Log.js";
import Manifest from "../Manifest.js";
import Fonts from "./Fonts.js";
import Spritesheets from "./Spritesheets.js";
import ColorTools from "./ColorTools.js";

var _2PI = 2 * Math.PI;

// rendering canvases & contexts
var _aCanvases = [];
var _aCtx = [];

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
	for (var i = 0; i < layers; i++) {
		// create canvas & context
		canvasDOM = document.createElement("canvas");
		_aCanvases.push(canvasDOM);
		canvasDOM.classList.add("jmpCanvas");
		canvasDOM.style.cursor = Manifest.get("/hideCursor") ? "none" : "";

		ctx = canvasDOM.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		_aCtx.push(ctx);

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
const pal = [
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
 * Retrieve the low-level rendering contexts for the DOM canvases.
 * Beware: Tinkering with these objects is for advanced users only!
 */

function alpha(i, v) {
	ctx(i).globalAlpha = v;
}

function ctx(i) {
	if (i == null) {
		return _aCtx;
	}
	return _aCtx[i || 0];
}

function clear(i, color) {
	if (color) {
		_aCanvases[i || 0].style.background = color;
	}
	_aCtx[i || 0].clearRect(0, 0, manifest.w, manifest.h);
}

function clear_rect(i, color, x, y, w, h) {
	if (color) {
		_aCanvases[i || 0].style.background = color;
	}

	// clear everything inside the given rectangle
	// for w/h we default to the screen-size
	_aCtx[i || 0].clearRect(x, y, w || manifest.w, h || manifest.h);
}

function trans(i, x, y) {
	_aCtx[i || 0].translate(x, y);
}

function save(i) {
	// save all
	if (i == null) {
		for (let c in _aCtx) {
			_aCtx[c].save();
		}
	} else {
		// save single ctx
		_aCtx[i || 0].save();
	}
}

function restore(i) {
	// restore all
	if (i == null) {
		for (let c in _aCtx) {
			_aCtx[c].restore();
		}
	} else {
		// restore single ctx
		_aCtx[i || 0].restore();
	}
}

// track pixel buffers if needed
let _pxBuffers = [];
function getBuffer(layer) {
	var oCtx = _aCtx[layer || 0];
	if (!_pxBuffers[layer]) {
		_pxBuffers[layer] = oCtx.getImageData(0, 0, manifest.w, manifest.h);
	}
	return _pxBuffers[layer];
}

// flush a pixel buffer
function pxFlush(layer) {
	let oCtx = _aCtx[layer || 0];
	oCtx.putImageData(_pxBuffers[layer], 0, 0);
}

function px(x, y, color, iLayer) {
	//oCtx.fillStyle = color || oCtx.fillStyle;
	//oCtx.fillRect(x, y, 1, 1);
	let d = getBuffer(iLayer);
	let c = ColorTools.parseColorString(color);
	let off = 4 * (y * d.width + x);
	d.data[off + 0] = c.r;
	d.data[off + 1] = c.g;
	d.data[off + 2] = c.b;
	d.data[off + 3] = 255;
}

function rect(x, y, w, h, color, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.strokeStyle = color || oCtx.strokeStyle;
	oCtx.strokeRect(n(x), n(y), w, h);
	oCtx.stroke();
	oCtx.closePath();
}

function rectf(x, y, w, h, color, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.fillStyle = color || oCtx.fillStyle;
	oCtx.fillRect(x, y, w, h);
}

function circ(x, y, r, color, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.arc(x, y, r, 0, _2PI, false);
	oCtx.closePath();
	oCtx.strokeStyle = color || oCtx.strokeStyle;
	oCtx.stroke();
}

function circf(x, y, r, color, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.arc(x, y, r, 0, _2PI, false);
	oCtx.closePath();
	oCtx.fillStyle = color || oCtx.fillStyle;
	oCtx.fill();
}

function tri(x0, y0, x1, y1, x2, y2, color, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.moveTo(n(x0), n(y0));
	oCtx.lineTo(n(x1), n(y1));
	oCtx.lineTo(n(x2), n(y2));
	oCtx.closePath();
	oCtx.strokeStyle = color || oCtx.strokeStyle;
	oCtx.stroke();
}

function trif(x0, y0, x1, y1, x2, y2, color, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.moveTo(x0, y0);
	oCtx.lineTo(x1, y1);
	oCtx.lineTo(x2, y2);
	oCtx.closePath();
	oCtx.fillStyle = color || oCtx.fillStyle;
	oCtx.fill();
}

function line(x0, y0, x1, y1, color, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.moveTo(n(x0), n(y0));
	oCtx.lineTo(n(x1), n(y1));
	oCtx.closePath();
	oCtx.strokeStyle = color || oCtx.strokeStyle;
	oCtx.stroke();
}

function spr(sheet, id, x, y, iLayer, sColor) {
	var oCtx = _aCtx[iLayer || 0];
	var oSprCanvas = Spritesheets.getCanvasFromSheet(sheet, id, sColor);
	oCtx.drawImage(oSprCanvas, x || 0, y || 0);
}

function spr_ext(sheet, id, x, y, w, h, iLayer, sColor, alpha) {
	var oCtx = _aCtx[iLayer || 0];
	var oSprCanvas = Spritesheets.getCanvasFromSheet(sheet, id, sColor);

	let oldAlpha;
	if (alpha !== undefined) {
		oldAlpha = oCtx.globalAlpha;
		if (oldAlpha !== alpha) {
			oCtx.globalAlpha = alpha;
		}
	}

	oCtx.drawImage(
		oSprCanvas,
		// take the whole src sprite canvas as a base
		0, // sx
		0, // sy
		oSprCanvas.width, // sw
		oSprCanvas.height, // sh
		// stretch it if w/h is given
		x || 0,
		y || 0,
		w || oSprCanvas.width, // default to canvas width
		h || oSprCanvas.height, // default to canvas height
	);

	if (oldAlpha) {
		oCtx.globalAlpha = oldAlpha;
	}
}

function grid(id, x, y, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	var grid = manifest.maps[id];
	if (!grid) {
		fail(`Grid '"${id}' does not exist!`);
	}
	oCtx.drawImage(grid.canvas, x, y);
}

// mapp = map part
// renders only a part of the map with the given source rectangle (sx, sy, sw, sh)
//function mapp(i, x, y, sx, sy, sw, sh, iLayer) {
	// TODO
//}

/**
 * Renders a single line of text.
 * @param {string} font the font which should be used for rendering, e.g. "font0"
 */
function text(font, x, y, sText, iLayer, color) {
	var oFont = manifest.fonts[font];
	var oCtx = _aCtx[iLayer || 0];
	var iOffsetX = 0;
	for (var i in sText) {
		var c = sText[i];
		oCtx.drawImage(Fonts.getChar(oFont, c, color), x + iOffsetX * oFont.w, y);
		iOffsetX++;
	}
}

/**
 * Renders multiline texts.
 */
function textm(font, x, y, sText, iLayer, color) {
	var oFont = manifest.fonts[font];

	// check for linebreak style
	var sLineDelimiter = sText.indexOf("\n\r") >= 0 ? "\n\r" : "\n";
	var aLines = sText.split(sLineDelimiter);

	for (var i = 0; i < aLines.length; i++) {
		var sLine = aLines[i];
		text(font, x, y + (i * oFont.h), sLine, iLayer, color);
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
const GFX_API = {
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
		return _aCanvases;
	}
};
export default GFX_API;

// debugging shortcut
window.GFX = GFX_API;