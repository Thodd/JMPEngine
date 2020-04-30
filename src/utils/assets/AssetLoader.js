import { log } from "../Log.js";
import Manifest from "../../Manifest.js";

// Loading loop
async function loadResources(assetsMap, type) {
	// get map of all assets of the given type
	let allResources = assetsMap[type];

	for (let resourceID in allResources) {
		let res = allResources[resourceID];
		res.id = resourceID;
		res.type = type;

		// check if URL needs to be resolved (default);
		if (!res.noUrlResolution) {
			res.url = Manifest.resolve(res.url);
		}

		// get loader plugin
		// TODO: refactor this once sound support is available
		let plugin = await import(allResources.plugin || "./plugins/loadImage.js");

		// trigger loading
		let resourceObject = await plugin.default(res);
		log("  > loaded: " + resourceObject.url + " (" + type + ")", "AssetLoader");
	}
}

/**
 * Loads all assets defined in the given <code>assetsMap</code>.
 * The asset definitions will be merged into the Manifest.
 * If you reuse keys, existing Manifest entries will be lost, which might lead to
 * unexpected results!
 *
 * You can provide a plugin for loading unknown asset types.
 * For this you need to provide the path to the plugin module. See the exsample below.
 *
 * By default all asset URLs are resolved relative to the <code>manifest.json<code> file.
 * If you don't want this to happen, you need to set the property <code>noUrlResolution</code> to <code>true</code> for each
 * asset you don't want to load from the resolved relative URL.
 * In this case you need to resolve the URL yourself beforehand; or provide an absolute URL to begin with.
 *
 * The default asset types are <code>spritesheets</code>, <code>fonts</code> and <code>sounds</code>.
 * These asset types don't need to specify a loader plugin.
 * Spritesheets and fonts will be loaded with the provided default image-loader plugin.
 * Sounds will be loaded with the provided default sound-loader plugin.
 *
 * @example
 * <pre>
 * import AssetLoader from "./src/utils/assets/AssetLoader";
 * AssetLoader.load({
 *     "spritesheets": {
 *          "character": {
 *               "url": "../path/to/file.png",
 *               "noUrlResolution": true,
 *               "w": 16,
 *               "h": 16
 *          }
 *     },
 *     "levels": {
 *          "plugin": "../plugins/loadLevels.js",
 *          "level1": {
 *               "url": "./path/to/level.xml",
 *               // additional stuff you like to store on your asset;
 *               // no restrictions, except when given in manifest.json it needs to be valid JSON, so no functions etc.
 *               "stuff": "maybe some tile information etc."
 *          }
 *     }
 * });
 * </pre>
 *
 * @param {object} assetsMap a map containing sets of assets.
 *     Default assets are "spritesheets", "fonts", "sounds".
 *     Additionally each given asset type can specify a <code>plugin</code> property containing the module path to a plugin,
 *     which will be dynamically included and triggered for loading your assets.
 *     Please see the example above.
 * @returns {Promise} a Promise which resolves once all assets have been loaded and merged into the Manifest.
 *     You can access the assets via <code>Manifest.get(`/assets/${yourAssetType}/...`)</code>.
 */
async function load(assetsMap) {

	log("Loading assets ...", "AssetLoader");

	for (let type in assetsMap) {

		// merge new asset blocks into existing assets stored in Manifest
		// they are grouped by type
		let newAssets = assetsMap[type];
		let existingAssets = Manifest.get("/assets");

		// make sure we have at least an empty object in the manifest
		existingAssets[type] = existingAssets[type] || {};

		// the existing assets might be overwritten by new assets
		Object.assign(existingAssets[type], newAssets);

		// finally trigger asset loading per type
		await loadResources(assetsMap, type);
	}

	log("All assets loaded!", "AssetLoader")
}

export default {
	load
};