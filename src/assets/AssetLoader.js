import { log } from "../utils/Log.js";
import Manifest from "./Manifest.js";

import PIXI from "../utils/PIXIWrapper.js";

import Spritesheets from "./Spritesheets.js";

/**
 * Loads all assets defined in the given <code>assetsMap</code>.
 * @param {object} assetsMap a map containing sets of assets.
 *     Default assets are "spritesheets".
 */
async function load(assetsMap) {

	let sheets = Object.keys(assetsMap.spritesheets);

	if (sheets.length > 0) {
		let loader = new PIXI.Loader(Manifest.getBaseUrl().toString());

		for (var sheetName of sheets) {
			loader.add(sheetName, assetsMap.spritesheets[sheetName].url);
		}

		return new Promise((resolve) => {
			loader.load((loader, resources) => {

				// process spritesheets
				Spritesheets.process(assetsMap.spritesheets, resources);

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