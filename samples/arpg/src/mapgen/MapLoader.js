import AssetLoader from "../../../../src/assets/AssetLoader.js";
import JSONCache from "../../../../src/assets/JSONCache.js";
import { assert } from "../../../../src/utils/Log.js";

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
				// right now the game only has one tile layer, so we just hard-code for Layer 0
				assert(mapDataRaw.layers[0].type == "tilelayer", `Layer 0 of map '${mapName}' is not a tile-layer!`, "MapLoader");
				maps[mapName] = {
					w: mapDataRaw.width,
					h: mapDataRaw.height,
					tiles: mapDataRaw.layers[0].data,
					tileset: mapDataRaw.tilesets[0].source,
					objects: []
				};

				// next we look at the object-layers
				if (mapDataRaw.layers[1]) {
					assert(mapDataRaw.layers[1].type == "objectgroup", `Layer 1 of map ${mapName} is not an object-layer!`, "MapLoader");
					let objectLayer = mapDataRaw.layers[1].objects;

					// process all objects one by one
					objectLayer.forEach((orgObj) => {
						let obj = {
							x: orgObj.x,
							y: orgObj.y,
							type: orgObj.type
						};
						maps[mapName].objects.push(obj);

						// we unwrap the object's properties again, since Tiled is nesting them a bit too deep for my taste...
						orgObj.properties.forEach((prop) => {
							obj[prop.name] = prop.value;
						});
					});
				}
			})

			return maps;
		});
	}
};

export default MapLoader;