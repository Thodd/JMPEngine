import { log } from "../utils/Log.js";

/**
 * Creates a new Canvas for all sprites in the sheet.
 */
function init(manifest) {

	if (Object.keys(manifest.spritesheets).length === 0) {
		log("No spritesheets defined.", "GFX.Spritesheets");
		return;
	}

	log("Processing spritesheets ...", "GFX.Spritesheets");

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
		log(`done: ${"sprites_" + s}`, "GFX.Spritesheets");

	}
	// clean up
	log("All spritesheets processed.", "GFX.Spritesheets");
}

export default {
	init
};