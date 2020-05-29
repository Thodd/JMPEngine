import { log, fail } from "../utils/Log.js";
import ColorTools from "./ColorTools.js";
import Manifest from "../Manifest.js";

let _manifest = null;

// Performance:
// We provide a getter for the imageData of the canvas, so we can lazily retrieve it if needed.
// Caching the imagedata for the fullsize of the sprite significantly improves the performance of the RAW RenderMode.
function mixinImageDataGetter(spriteCanvas) {
	spriteCanvas._getImgDataFullSize = function() {
		if (!spriteCanvas._imgDataFullSize) {
			let ctx;
			// convert images to canvas first, otherwise we can't get the image-data
			if (spriteCanvas.nodeName && spriteCanvas.nodeName.toLowerCase() === "img") {
				let can = document.createElement("canvas");
				can.width = spriteCanvas.width;
				can.height = spriteCanvas.height;
				ctx = can.getContext("2d");
				ctx.drawImage(spriteCanvas, 0, 0);
				spriteCanvas = can;
			}
			ctx = spriteCanvas.getContext("2d");
			spriteCanvas._imgDataFullSize = ctx.getImageData(0, 0, spriteCanvas.width, spriteCanvas.height);
		}
		return spriteCanvas._imgDataFullSize;
	};
}

/**
 * Creates a new Canvas for all sprites in the sheet.
 */
function process(sheet) {

	let rawSheet = sheet.raw;
	mixinImageDataGetter(rawSheet,);

	// defaults to the full raw image size
	sheet.w = sheet.w || rawSheet.width;
	sheet.h = sheet.h || rawSheet.height;

	// count how many sprites we have per row/column
	sheet._verticalSpritesCount = rawSheet.height / sheet.h;
	sheet._horizontalSpritesCount = rawSheet.width / sheet.w;

	/**
	 * If a sheet is marked as "colorable: true", we split it into smaller sprites.
	 * Later, during rendering, we can quickly access these single sprites and color them lazily.
	 * This of course leads to higher memory consumption for bigger spritesheets,
	 * but the runtime access is optimized.
	 */
	if (sheet.colorable) {
		sheet._sprites = []; // list of all sprites in the sheet
		sheet._colorCache = {}; // initially an empty color cache

		for (let y = 0, rows = sheet._verticalSpritesCount; y < rows; y++) {
			for (let x = 0, cols = sheet._horizontalSpritesCount; x < cols; x++) {
				let spriteCanvas = document.createElement("canvas");
				spriteCanvas.width = sheet.w;
				spriteCanvas.height = sheet.h;

				let ctx = spriteCanvas.getContext("2d");

				// ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
				ctx.drawImage(
					rawSheet,
					x * sheet.w,
					y * sheet.h,
					sheet.w,
					sheet.h,
					0,
					0,
					sheet.w,
					sheet.h
				);

				mixinImageDataGetter(spriteCanvas);

				sheet._sprites.push(spriteCanvas);
			}
		}
	}

	log(`  > done: ${sheet.name}`, "Spritesheets.process");

}

/**
 * Returns the sheet definition in the manifest.
 * @param {string} sheet
 */
function getSheet(sheetName) {
	if (!_manifest) {
		_manifest = Manifest.get();
	}
	return _manifest.assets.spritesheets[sheetName];
}

/**
 * Retrieves the (colorized) Sprite-Canvas from a spritesheet.
 * @param {string} sheetName the name of the spritesheet
 * @param {int} id the id of the sprite inside the given spritesheet
 * @param {string} color a hex color string, e.g. #FF0085
 */
function getColorizedCanvasFromSheet(sheetName, id, color) {
	// only retrieve manifest once to save some time (actually quite a lot of time if called at 60fps...)
	if (!_manifest) {
		_manifest = Manifest.get();
	}

	let sheet =  _manifest.assets.spritesheets[sheetName];

	if (!sheet) {
		fail(`Spritesheet '${sheetName}' does not exist!`, "Spritesheets");
	}

	let spriteSrcCanvas = sheet._sprites[id || 0]; // default version is not colorized
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
			mixinImageDataGetter(spriteSrcCanvas);
			// save it in cache
			colorCacheEntry[id] = spriteSrcCanvas;
		}
	}

	// if no color was used the default canvas is returned
	return spriteSrcCanvas;
}

export default {
	process,
	getColorizedCanvasFromSheet,
	getSheet
};