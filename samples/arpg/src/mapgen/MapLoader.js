import AssetLoader from "../../../../src/assets/AssetLoader.js";
import JSONCache from "../../../../src/assets/JSONCache.js";
import { assert, fail } from "../../../../src/utils/Log.js";

// Type maps to check for Map sanity
import ObjectTypes from "./ObjectTypes.js";
import EnemyTypes from "../actors/enemies/EnemyTypes.js";

const UNKNOWN_OBJ_TYPE = "UNKNOWN_OBJ_TYPE";

/**
 * Simple parse for an Objects type.
 * Tiled stores the objects in separate files for easier reuse as Templates.
 * Sadly this makes it more complicated to get the object type without loading these
 * files.
 * It's good enough to know the Filename, everything else is embedded in the object definition.
 */
const templateRegex = /([^\/]+)(?=\.\w+$)/gi;
function parseObjectType(typeString) {
	try {
		return typeString.match(templateRegex)[0].toUpperCase();
	} catch(e) {
		return UNKNOWN_OBJ_TYPE;
	}
}


/**
 * Sanity check for each loaded map's objects.
 */
function validateObjectType(obj, mapName) {
	// check for an unknown type
	if (!obj.type || !ObjectTypes[obj.type] || obj.type === UNKNOWN_OBJ_TYPE) {
		fail(`Unknown object type '${obj.type}' found in map '${mapName}'.\nObject at (${obj.x}, ${obj.y}).`, "MapLoader");
	}

	// Now check if the 'name' of the object is a valid Enemy type
	if (obj.type === ObjectTypes.ENEMY) {
		assert(EnemyTypes[obj.name.toUpperCase()] !== undefined, `Unknown Enemy type '${obj.name}' found in ${mapName} at (${obj.x},${obj.y}).`, "MapLoader");
	}
}

/**
 * Allows for dynamic map-loading.
 * Used to load all maps which are not known to be needed initially.
 *
 * All JSON files which are known to be needed initially could also be load through the manifest.json.
 */
const MapLoader = {
	/**
	 * Loads the given set of Maps in JSON format.
	 * @param {object} mapDefs maps to load
	 */
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
							name: (orgObj.name || "").toUpperCase(), // optional name (relevant for Enemies)
							type: parseObjectType(orgObj.template) || UNKNOWN_OBJ_TYPE // the template file path from Tiled
						};
						maps[mapName].objects.push(obj);

						validateObjectType(obj, mapName);

						// we unwrap the object's properties again, since Tiled is nesting them a bit too deep for my taste...
						if (orgObj.properties) {
							orgObj.properties.forEach((prop) => {
								obj[prop.name] = prop.value;
							});
						}
					});
				}
			})

			return maps;
		});
	}
};

export default MapLoader;