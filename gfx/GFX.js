import { log, error, fail } from "../core/Utils.js";

var _2PI = 2 * Math.PI;

// rendering canvases & contexts
var _aCanvases = [];
var _aCtx = [];

// font
var _sChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@! .:,;";
var _oCurrentFont = null;

/**
 * Creates a new Canvas for all sprites in the sheet.
 */
function processSpritesheets() {
	log("processing spritesheets...", "[GFX]");

	// all sheets
	for (var s in manifest.spritesheets) {

		// single sheet
		var oSheet = manifest.spritesheets[s];
		oSheet.sprites = []; // list of all sprites in the sheet
		var oRawSheet = oSheet.raw;
		var _iVerticalNoSprites = oRawSheet.height / oSheet.w;
		var _iHorizontalNoSprites = oRawSheet.width / oSheet.h;
		for (var y = 0; y < _iVerticalNoSprites; y++) {
			for (var x = 0; x < _iHorizontalNoSprites; x++) {
				var oSpriteCanvas = document.createElement("canvas");
				oSpriteCanvas.width = oSheet.w;
				oSpriteCanvas.height = oSheet.h;
				var ctx = oSpriteCanvas.getContext("2d");
				// ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
				ctx.drawImage(oRawSheet, x * oSheet.w, y * oSheet.h, oSheet.w, oSheet.h, 0, 0, oSheet.w, oSheet.h);
				oSheet.sprites.push(oSpriteCanvas);
			}
		}
		log("   done: sprites_" + s, "[GFX]");

	}
	// clean up
	log("all spritesheets processed", "[GFX]");
}

/**
 * Creates the Font tileset
 */
function processFonts() {
	log("processing fonts...", "[GFX]");

	for (var s in manifest.fonts) {
		var oFont = manifest.fonts[s];
		oFont.chars = {};

		var iCharID = 0;
		for (var y = 0; y < 4; y++) {
			for (var x = 0; x < 26; x++) {
				var oCharCanvas = document.createElement("canvas");
				oCharCanvas.width = oFont.w;
				oCharCanvas.height = oFont.h;
				var ctx = oCharCanvas.getContext("2d");
				ctx.drawImage(oFont.raw, x * oFont.w, y * oFont.h, oFont.w, oFont.h, 0, 0, oFont.w, oFont.h);
				// map for the char colors
				// IMPORTANT: the font file has a couple of empty spaces for additions in the future
				// these empty spaces will be written to the "undefined" slot of the oFont.chars map
				oFont.chars[_sChars[iCharID]] = {
					default: oCharCanvas
				};
				iCharID++;
			}
		}
	}
	log("all fonts processed", "[GFX]");
}

/**
 * Gets the given char in the wanted color.
 * The colored char canvas is cached.
 */
function _getChar(oFont, c, sColor) {
	var oChar = oFont.chars[c];
	if (!oChar[sColor]) {
		oChar[sColor] = _colorizeCanvas(oChar.default, sColor);
	}
	return oChar[sColor];
}

/**
 * Parses a color string. Either hex or rgba.
 */
var _parseColorString = function (sColor) {
	if (sColor[0] === "#") {
		return _parseHexColorToRGB(sColor);
	} else {
		error("unknown color coding: '" + sColor + "'");
	}
};

/**
 * Parses a hex color value (e.g. #FF0000) to a javascript object containing r/g/b/a values from 0 to 255.
 */
var _parseHexColorToRGB = function (sHex) {
	sHex = sHex.substring(1, sHex.length);
	return {
		r: parseInt(sHex[0] + sHex[1], 16),
		g: parseInt(sHex[2] + sHex[3], 16),
		b: parseInt(sHex[4] + sHex[5], 16)
	};
};

/**
 * Colors all white pixels in the given src canvas with the given color value.
 * @public
 */
var _colorizeCanvas = function (oSrcCanvas, sColor) {
	sColor = sColor || gfx.pal[0];

	var oRGB = _parseColorString(sColor);
	// create target canvas
	var oTarget = document.createElement("canvas");
	oTarget.width = oSrcCanvas.width;
	oTarget.height = oSrcCanvas.height;

	// get the raw data of the src
	var oSrcData = oSrcCanvas.getContext("2d").getImageData(0, 0, oSrcCanvas.width, oSrcCanvas.height);
	var oSrcRaw = oSrcData.data;

	for (var i = 0, iPixelCount = oSrcRaw.length; i < iPixelCount; i += 4) {
		// everything else is colored
		oSrcRaw[i  ] = oRGB.r;
		oSrcRaw[i+1] = oRGB.g;
		oSrcRaw[i+2] = oRGB.b;
		oSrcRaw[i+3] = oSrcRaw[i+3]; // alpha is not touched
	}

	// write the tinted src data to the target canvas
	oTarget.getContext("2d").putImageData(oSrcData, 0, 0);

	return oTarget;
};

/**
 * Creates the rendering surface
 */
function setupCanvases(containerDOM) {
	var canvasDOM, ctx;

	// initial first 8 layers
	for (var i = 0; i < 8; i++) {
		// create canvas & context
		canvasDOM = document.createElement("canvas");
		_aCanvases.push(canvasDOM);
		canvasDOM.className = "jmp_canvas";
		Object.assign(canvasDOM.style, {
			background: manifest.clearColor,
			cursor: manifest.hideCursor ? "none" : ""
		});

		ctx = canvasDOM.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		_aCtx.push(ctx);

		canvasDOM.width = manifest.w;
		canvasDOM.height = manifest.h;

		canvasDOM.style.width = manifest.scale * manifest.w;
		canvasDOM.style.height = manifest.scale * manifest.h;

		containerDOM.appendChild(canvasDOM);
	}
}

// hack to make rendering less blurred
function n(x) {
	return x + 0.5;
}

/**
 * GFX Module API
 */
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

function clear(i, sColor) {
	if (sColor) {
		_aCanvases[i || 0].style.background = sColor;
	}
	// gfx.clear()  -  clear ALL inside viewport
	_aCtx[i || 0].clearRect(cam.x, cam.y, gfx.w, gfx.h);
}

function px(x, y, sColor, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.fillStyle = sColor || oCtx.fillStyle;
	oCtx.fillRect(x, y, 1, 1);
}

function rect(x, y, w, h, sColor, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.strokeStyle = sColor || oCtx.strokeStyle;
	oCtx.strokeRect(n(x), n(y), w, h);
	oCtx.stroke();
	oCtx.closePath();
}

function rectf(x, y, w, h, sColor, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.fillStyle = sColor || oCtx.fillStyle;
	oCtx.fillRect(x, y, w, h);
}

function circ(x, y, r, sColor, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.arc(x, y, r, 0, _2PI, false);
	oCtx.closePath();
	oCtx.strokeStyle = sColor || oCtx.strokeStyle;
	oCtx.stroke();
}

function circf(x, y, r, sColor, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.arc(x, y, r, 0, _2PI, false);
	oCtx.closePath();
	oCtx.fillStyle = sColor || oCtx.fillStyle;
	oCtx.fill();
}

function tri(x0, y0, x1, y1, x2, y2, sColor, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.moveTo(n(x0), n(y0));
	oCtx.lineTo(n(x1), n(y1));
	oCtx.lineTo(n(x2), n(y2));
	oCtx.closePath();
	oCtx.strokeStyle = sColor || oCtx.strokeStyle;
	oCtx.stroke();
}

function trif(x0, y0, x1, y1, x2, y2, sColor, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.moveTo(x0, y0);
	oCtx.lineTo(x1, y1);
	oCtx.lineTo(x2, y2);
	oCtx.closePath();
	oCtx.fillStyle = sColor || oCtx.fillStyle;
	oCtx.fill();
}

function line(x0, y0, x1, y1, sColor, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	oCtx.beginPath();
	oCtx.moveTo(n(x0), n(y0));
	oCtx.lineTo(n(x1), n(y1));
	oCtx.closePath();
	oCtx.strokeStyle = sColor || oCtx.strokeStyle;
	oCtx.stroke();
}

function spr(sheet, i, x, y, iLayer) {
	var oSheet = manifest.spritesheets[sheet];
	var oCtx = _aCtx[iLayer || 0];
	oCtx.drawImage(oSheet.sprites[i || 0], x, y);
}

function map(id, x, y, iLayer) {
	var oCtx = _aCtx[iLayer || 0];
	var oMap = manifest.maps[id];
	if (!oMap) {
		fail("Map '" + id + "' does not exist!");
	}
	oCtx.drawImage(oMap.canvas, x, y);
}

// mapp = map part
// renders only a part of the map with the given source rectangle (sx, sy, sw, sh)
function mapp(i, x, y, sx, sy, sw, sh, iLayer) {
	// TODO
}

function text(font, x, y, sText, iLayer, sColor) {
	var oFont = manifest.fonts[font];
	var oCtx = _aCtx[iLayer || 0];
	var iOffsetX = 0;
	for (var i in sText) {
		var c = sText[i];
		oCtx.drawImage(_getChar(oFont, c, sColor), x + iOffsetX * oFont.w, y);
		iOffsetX++;
	}
}

let manifest = null;
let containerDOM = null;

const DEFAULTS = {
	w: 184,
	h: 136,
	scale: 2,
	fps: 60,
	hideCursor: false,
	clearColor: "#000000"
};

function init(containerID, mani) {
	manifest = Object.assign(DEFAULTS, mani);

	// check container dom
	containerDOM = document.getElementById(containerID);
	if (!containerDOM) {
		fail("Container DOM ID is not valid!", "GFX");
	}

	setupCanvases(containerDOM);

	//processSpritesheets();

	//processFonts();
}

/********************************* private *********************************/
export default {
	pal,

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