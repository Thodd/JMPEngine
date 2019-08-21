import { log, warn, error, fail } from "../utils/Log.js";
import Fonts from "./Fonts.js";
import Spritesheets from "./Spritesheets.js";
import Grid from "./Grid.js";

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
			border: 1px solid #ffffff;
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

	let canvas_scaled_w = manifest.scale * manifest.w;
	let canvas_scaled_h = manifest.scale * manifest.h;

	// wrap layers in a div
	let wrapperDiv = document.createElement("div");
	wrapperDiv.classList.add("jmpWrapper");
	wrapperDiv.style.width = canvas_scaled_w;
	wrapperDiv.style.height = canvas_scaled_h;

	containerDOM.appendChild(wrapperDiv);

	for (var i = 0; i < manifest.layers; i++) {
		// create canvas & context
		canvasDOM = document.createElement("canvas");
		_aCanvases.push(canvasDOM);
		canvasDOM.classList.add("jmpCanvas");
		canvasDOM.style.cursor = manifest.hideCursor ? "none" : "";

		ctx = canvasDOM.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		_aCtx.push(ctx);

		// the style w/h are scaled
		canvasDOM.style.width = canvas_scaled_w;
		canvasDOM.style.height = canvas_scaled_h;

		// the canvas itself has a fixed width
		canvasDOM.width = manifest.w;
		canvasDOM.height = manifest.h;

		wrapperDiv.appendChild(canvasDOM);
	}

	log("Canvases created.", "GFX");
}

// the public camera interface
let _camX = 0;
let _camY = 0;
const cam = {
	set x (iXValue) {
		_camX = iXValue * -1;
	},
	get x() {
		return -1 * _camX;
	},
	set y (iYValue) {
		_camY = iYValue * -1;
	},
	get y() {
		return -1 * _camY;
	}
};

/**
 * GFX Module API
 */

// to make geometric rendering less blurred
function n(x) {
	return x + 0.5;
}

// for now the pico8 palette
const pal = [
	// black, dark blue, dark purple, dark-green
	"#000000", "#1D2B53", "#7E2553", "#008751",
	// brown, dark gray, light gray, white
	"#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8",
	// red, orange, yellow, green
	"#FF004D", "#FFA300", "#FFEC27", "#00E436",
	// blue, indigo, pink, peach
	"#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"
];

function ctx(i) {
	return _aCtx[i || 0];
}

function clear(i, color) {
	if (color) {
		_aCanvases[i || 0].style.background = color;
	}
	// clear everything inside viewport
	_aCtx[i || 0].clearRect(cam.x, cam.y, manifest.w, manifest.h);
}

function px(x, y, color, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.fillStyle = color || oCtx.fillStyle;
	oCtx.fillRect(x, y, 1, 1);
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

function spr(sheet, i, x, y, iLayer) {
	var oSheet = manifest.spritesheets[sheet];
	var oCtx = _aCtx[iLayer || 0];
	oCtx.drawImage(oSheet.sprites[i || 0], x, y);
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

let initialized = false;
let manifest = null;
let containerDOM = null;

function init(containerID, mani) {

	if (initialized) {
		warn("already initialized!", "GFX");
		return;
	}

	manifest = mani;

	// check container dom
	containerDOM = document.getElementById(containerID);
	if (!containerDOM) {
		fail("Container DOM ID is not valid!", "GFX");
	}

	log("Initializing GFX module ... ", "GFX");

	setupCSS();

	setupCanvases(containerDOM);

	log("Initializing submodules ...", "GFX");

	Spritesheets.init(manifest);

	Fonts.init(manifest);

	Grid.init(manifest);

	initialized = true;
}

/********************************* private *********************************/
export default {
	// low-level API
	cam,
	pal,
	ctx,
	clear,
	px,
	rect,
	rectf,
	circ,
	circf,
	tri,
	trif,
	line,
	spr,
	grid,
	//mapp,
	text,

	// width and height
	get w() {
		return manifest.w;
	},
	set w(v) {
		error("Screen width can only be set from manifest!", "GFX");
	},
	get h() {
		return manifest.h;
	},
	set h(v) {
		error("Screen width can only be set from manifest!", "GFX");
	},

	init
};