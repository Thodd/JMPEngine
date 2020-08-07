import { log } from "../utils/Log.js";
import Manifest from "./Manifest.js";

import PIXI from "../core/PIXIWrapper.js";

import Spritesheets from "./Spritesheets.js";
import Fonts from "./Fonts.js";
import JSONCache from "./JSONCache.js";

/**
 * Loads all assets defined in the given <code>assetsMap</code>.
 * @param {object} assetsMap a map containing sets of assets.
 *     Default assets are "spritesheets".
 */
async function load(assetsMap) {

	log("Loading assets ...", "AssetLoader");

	let loader = new PIXI.Loader(Manifest.getBaseUrl().toString());

	// shorthands
	let allSheets = assetsMap.spritesheets || {};
	let allJson = assetsMap.json || {};
	let allFonts = assetsMap.fonts || {};


	// 1. first we check if we got font definitions which require an additional json file beforehand
	let allFontNames = Object.keys(allFonts);
	let fontJsonFiles = [];
	for (let fontName of allFontNames) {
		let fontDef = allFonts[fontName];
		// url in the font definition means we need to load that json file
		if (fontDef.url) {
			// place the font json file url into the json section of the manifest: "/assets/json/..."
			// we use the font-name for reference later after json loading
			allJson[fontName] = {
				url: fontDef.url
			};
			fontJsonFiles.push(fontName);
		}
	}


	// 2. load json data
	let jsonLoading = new Promise((resolve) => {
		let jsonFiles = Object.keys(allJson);

		if (jsonFiles.length > 0) {
			for (let jsonName of jsonFiles) {
				loader.add(jsonName, assetsMap.json[jsonName].url);
			}
			loader.load((loader, resources) => {

				// after loading the json files we check which of these belong to a font definition
				fontJsonFiles.forEach((fontName) => {

					// we overwrite the original font-def (only url) with the data from the json file
					let fontData = resources[fontName].data;
					allFonts[fontName] = fontData;

					// generate a sheet name to avoid conflicts if a font is named like a sprite (for whatever reason...)
					let sheetName = `${fontName}_sheet`;

					// extract sprite sheet info
					// used to load the sheet for this font
					allSheets[sheetName] = {
						url: fontData.url,
						w: fontData.w,
						h: fontData.h
					};

					// update font def with sheet info
					fontData.spritesheet = sheetName;
				});

				resolve(resources);
			});
		} else {
			log("No json files to load.", "AssetLoader");
			resolve({});
		}
	});


	// 3. load spritesheets
	return jsonLoading.then((jsonResources) => {

		// cache json files
		for (let jsonName in jsonResources) {
			JSONCache.add(jsonName, jsonResources[jsonName].data);
		}

		// sheets are loaded after json files: we might need to wait for some font data
		let sheetLoading = new Promise((resolve) => {
			let sheets = Object.keys(allSheets || {});

			if (sheets.length > 0) {

				for (let sheetName of sheets) {
					loader.add(sheetName, allSheets[sheetName].url);
				}

				loader.load((loader, resources) => {
					resolve(resources);
				});
			} else {
				log("No spritesheets to load.", "AssetLoader");
				resolve({});
			}
		});

		return sheetLoading;
	}).then((sheetResources) => {

		// 4. Process sprite and font resources
		// if no sheets have been loaded we don't need to process anything and we also cannot have any fonts
		if (sheetResources) {
			// process spritesheets
			Spritesheets.process(allSheets, sheetResources);

			// process fonts (build char table, kerning, ...)
			Fonts.process(allFonts, sheetResources);
		}

		log("All assets loaded and processed.", "AssetLoader");
	});
}

export default {
	load
};