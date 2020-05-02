import { log, fail } from "../utils/Log.js";
import ColorTools from "./ColorTools.js";
import Manifest from "../Manifest.js";

/**
 * Creates a new Canvas for all sprites in the sheet.
 */
function process(sheet) {

	// single sheet main values
	sheet.sprites = []; // list of all sprites in the sheet
	sheet._colorCache = {}; // initially an empty color cache

	var oRawSheet = sheet.raw;

	// defaults to the full raw image size
	var iSpriteWidth = sheet.w || oRawSheet.width;
	var iSpriteHeight = sheet.h || oRawSheet.height;

	var _iVerticalNoSprites = oRawSheet.height / iSpriteWidth;
	var _iHorizontalNoSprites = oRawSheet.width / iSpriteHeight;

	for (var y = 0; y < _iVerticalNoSprites; y++) {
		for (var x = 0; x < _iHorizontalNoSprites; x++) {
			var oSpriteCanvas = document.createElement("canvas");
			oSpriteCanvas.width = iSpriteWidth;
			oSpriteCanvas.height = iSpriteHeight;
			var ctx = oSpriteCanvas.getContext("2d");
			// ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
			ctx.drawImage(
				oRawSheet,
				x * iSpriteWidth,
				y * iSpriteHeight,
				iSpriteWidth,
				iSpriteHeight,
				0,
				0,
				iSpriteWidth,
				iSpriteHeight
			);
			sheet.sprites.push(oSpriteCanvas);
		}
	}
	log(`  > done: ${sheet.name}`, "GFX.Spritesheets");

}

/**
 * Returns the sheet definition in the manifest.
 * @param {string} sheet
 */
function getSheet(sheet) {
	return Manifest.get(`/assets/spritesheets/${sheet}`);
}

/**
 * Retrieves the (colorized) Sprite-Canvas from a spritesheet.
 * @param {string} sheet the name of the spritesheet
 * @param {int} id the id of the sprite inside the given spritesheet
 * @param {string} sColor a hex color string, e.g. #FF0085
 */
function getCanvasFromSheet(sheet, id, sColor) {
	var oSheet = Manifest.get(`/assets/spritesheets/${sheet}`);
	if (!oSheet) {
		fail(`Spritesheet '${sheet}' does not exist!`, "GFX");
	}

	var oSprSrcCanvas = oSheet.sprites[id || 0]; // default version is not colorized
	if (!oSprSrcCanvas) {
		fail(`Sprite-ID '${id}' does not exist in Spritesheet '${sheet}'!`, "GFX");
	}

	if (sColor) {
		// make sure we have a color cache per spritesheet
		var mColorCache = oSheet._colorCache[sColor];
		if (!mColorCache) {
			mColorCache = oSheet._colorCache[sColor] = {};
		}

		// check cache for an already colorized canvas
		var oColorizedCanvas = mColorCache[id];
		if (oColorizedCanvas) {
			return oColorizedCanvas;
		} else {
			// colorize canvas
			oSprSrcCanvas = ColorTools.colorizeCanvas(oSprSrcCanvas, sColor);
			// save it in cache
			mColorCache[id] = oSprSrcCanvas;
		}
	}

	// if no color was used the default canvas is returned
	return oSprSrcCanvas;
}

export default {
	process,
	getCanvasFromSheet,
	getSheet
};