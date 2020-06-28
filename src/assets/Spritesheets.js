import { log } from "../utils/Log.js";

import PIXI from "../utils/PIXIWrapper.js";

const sheets = {};

/**
 * Creates a new Canvas for all sprites in the sheet.
 */
function process(allSheets, pixiResources) {

	// @PIXI: Create splitted textures from base texture
	for (let sheetName in allSheets) {
		let sheetDef = allSheets[sheetName];

		// track sheets internally (don't modify allSheets!)
		let sheet = sheets[sheetName] = {
			name: sheetName,
			orgTexture: pixiResources[sheetName].texture,
			textures: []
		};

		// w/h are the size of a single frame, if none given we assume the full size should be used
		sheet.w = sheetDef.w || sheet.orgTexture.width;
		sheet.h = sheetDef.h || sheet.orgTexture.height;
		sheet.fullWidth = sheet.orgTexture.width;
		sheet.fullHeight = sheet.orgTexture.height;

		// if the sheet does not need to be splitted we set the ID 0 to the orgTexture
		if (sheet.w == sheet.orgTexture.width && sheet.h == sheet.orgTexture.height) {
			sheet.textures[0] = sheet.orgTexture;
		} else {
			// now we count through the spritesheet IDs and split it along the given w/h values
			// IDs are counted from 'left to right' and 'top to bottom'
			let rows = sheet.fullHeight / sheet.h;
			let cols = sheet.fullWidth / sheet.w;

			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					let frame = new PIXI.Rectangle(x * sheet.w, y * sheet.h, sheet.w, sheet.h);
					let tex = new PIXI.Texture(sheet.orgTexture, frame);
					// @PIXI: set the default scale mode to nearest so we have a nice crisp pixel-look :)
					tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
					sheet.textures.push(tex);
				}
			}

		}

		log(`  > done: ${sheet.name}`, "Spritesheets.process");
	}

}

/**
 * Returns the sheet definition in the manifest.
 * @param {string} sheet
 */
function getSheet(sheetName) {
	return sheets[sheetName];
}

export default {
	process,
	getSheet
};