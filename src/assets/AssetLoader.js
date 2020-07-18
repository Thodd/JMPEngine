import { log } from "../utils/Log.js";
import Manifest from "./Manifest.js";

import PIXI from "../core/PIXIWrapper.js";

import Spritesheets from "./Spritesheets.js";
import Fonts from "./Fonts.js";

/**
 * Loads all assets defined in the given <code>assetsMap</code>.
 * @param {object} assetsMap a map containing sets of assets.
 *     Default assets are "spritesheets".
 */
async function load(assetsMap) {

	let loader = new PIXI.Loader(Manifest.getBaseUrl().toString());

	// json data
	let json = Object.keys(assetsMap.json);

	// sheets
	let sheets = Object.keys(assetsMap.spritesheets);

	if (sheets.length > 0) {

		for (let jsonName of json) {
			loader.add(jsonName, assetsMap.json[jsonName].url);
		}

		for (let sheetName of sheets) {
			loader.add(sheetName, assetsMap.spritesheets[sheetName].url);
		}

		return new Promise((resolve) => {
			loader.load((loader, resources) => {

				// process spritesheets
				Spritesheets.process(assetsMap.spritesheets, resources);

				// process fonts (build char table, kerning, ...)
				Fonts.process(assetsMap.fonts, resources);

				resolve();
			});
		});
	} else {
		log("No spritesheets to load.", "AssetLoader");
	}
}

export default {
	load
};