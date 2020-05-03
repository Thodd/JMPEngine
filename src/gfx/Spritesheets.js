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

	let rawSheet = sheet.raw;

	// defaults to the full raw image size
	let spriteWidth = sheet.w || rawSheet.width;
	let spriteHeight = sheet.h || rawSheet.height;

	let verticalSpritesCount = rawSheet.height / spriteWidth;
	let horizontalSpritesCount = rawSheet.width / spriteHeight;

	for (let y = 0; y < verticalSpritesCount; y++) {
		for (let x = 0; x < horizontalSpritesCount; x++) {
			let spriteCanvas = document.createElement("canvas");
			spriteCanvas.width = spriteWidth;
			spriteCanvas.height = spriteHeight;
			let ctx = spriteCanvas.getContext("2d");
			// ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
			ctx.drawImage(
				rawSheet,
				x * spriteWidth,
				y * spriteHeight,
				spriteWidth,
				spriteHeight,
				0,
				0,
				spriteWidth,
				spriteHeight
			);
			sheet.sprites.push(spriteCanvas);
		}
	}
	log(`  > done: ${sheet.name}`, "Spritesheets.process");

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
 * @param {string} sheetName the name of the spritesheet
 * @param {int} id the id of the sprite inside the given spritesheet
 * @param {string} color a hex color string, e.g. #FF0085
 */
function getCanvasFromSheet(sheetName, id, color) {
	let sheet = Manifest.get(`/assets/spritesheets/${sheetName}`);
	if (!sheet) {
		fail(`Spritesheet '${sheetName}' does not exist!`, "Spritesheets");
	}

	let spriteSrcCanvas = sheet.sprites[id || 0]; // default version is not colorized
	if (!spriteSrcCanvas) {
		fail(`Sprite-ID '${id}' does not exist in Spritesheet '${sheetName}'!`, "Spritesheets");
	}

	if (color) {
		// make sure we have a color cache per spritesheet
		let colorCacheEntry = sheet._colorCache[color];
		if (!colorCacheEntry) {
			colorCacheEntry = sheet._colorCache[color] = {};
		}

		// check cache for an already colorized canvas
		let colorizedCanvas = colorCacheEntry[id];
		if (colorizedCanvas) {
			return colorizedCanvas;
		} else {
			// colorize canvas
			spriteSrcCanvas = ColorTools.colorizeCanvas(spriteSrcCanvas, color);
			// save it in cache
			colorCacheEntry[id] = spriteSrcCanvas;
		}
	}

	// if no color was used the default canvas is returned
	return spriteSrcCanvas;
}

export default {
	process,
	getCanvasFromSheet,
	getSheet
};