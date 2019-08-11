import { log, error } from "../utils/Log.js";

// supported characters
var _chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@! .:,;";

/**
 * Creates the Font tileset
 */
function init(manifest) {

	if (Object.keys(manifest.fonts).length === 0) {
		log("No fonts defined.", "GFX.Fonts");
		return;
	}

	log("Processing fonts ...", "GFX.Fonts");

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
				oFont.chars[_chars[iCharID]] = {
					default: oCharCanvas
				};
				iCharID++;
			}
		}
	}

	log("All fonts processed.", "GFX.Fonts");
}

/**
 * Gets the given char in the wanted color.
 * The colored char canvas is cached.
 */
function getChar(oFont, c, color) {
	var oChar = oFont.chars[c];
	if (!oChar[color]) {
		oChar[color] = colorizeCanvas(oChar.default, color);
	}
	return oChar[color];
}

/**
 * Parses a color string. Either hex or rgba.
 */
function parseColorString(color) {
	if (color[0] === "#") {
		return parseHexColorToRGB(color);
	} else {
		error("unknown color coding: '" + color + "'", "GFX.Font");
	}
}

/**
 * Parses a hex color value (e.g. #FF0000) to a javascript object containing r/g/b/a values from 0 to 255.
 */
function parseHexColorToRGB(sHex) {
	sHex = sHex.substring(1, sHex.length);
	return {
		r: parseInt(sHex[0] + sHex[1], 16),
		g: parseInt(sHex[2] + sHex[3], 16),
		b: parseInt(sHex[4] + sHex[5], 16)
	};
}

/**
 * Colors all white pixels in the given src canvas with the given color value.
 */
function colorizeCanvas (oSrcCanvas, color) {
	color = color || "#FF0085";

	var oRGB = parseColorString(color);
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
}

export default {
	init,
	getChar
};