import AssetLoader from "../../../../src/assets/AssetLoader.js";
import JSONCache from "../../../../src/assets/JSONCache.js";

/**
 * Allows for dynamic map-loading.
 * Used to load all maps which are not known to be needed initially.
 *
 * All JSON files which are known to be needed initially could also be load through the manifest.json.
 */
const MapLoader = {
	load(mapDefs) {
		let mapNames = Object.keys(mapDefs);

		return AssetLoader.load({
			json: mapDefs
		}).then(() => {
			let maps = {};

			// process loaded maps
			mapNames.forEach((mapName) => {
				let mapDataRaw = JSONCache.get(mapName);
				// for simplicity we unwrap some of the information in the Tiled JSON format
				maps[mapName] = {
					w: mapDataRaw.width,
					h: mapDataRaw.height,
					tiles: mapDataRaw.layers[0].data,
					tileset: mapDataRaw.tilesets[0].source
				};
			})

			return maps;
		});
	}
};

export default MapLoader;