import { assert } from "../../../../src/utils/Log.js";
import JSONCache from "../../../../src/assets/JSONCache.js";
import { exposeOnWindow } from "../../../../src/utils/Helper.js";

import TileTypes from "./TileTypes.js";

let _initialized;

// The list of tile properties, ordered by the ID.
// This array contains all typed AND untyped tile properties.
const _tilePropertiesByID = [];


/**
 * Wraps the 'Tiled' tileset JSON data for easier access to tile properties.
 */
const Tileset = {
	init() {
		if (!_initialized) {
			_initialized = true;

			let tilesetDataRaw = JSONCache.get("tileset16");

			// unwrap raw Tiled JSON tileset data
			let tileCount = tilesetDataRaw.tiles.length;

			for (let i = 0; i < tileCount; i++) {
				let tileRaw = tilesetDataRaw.tiles[i];

				// empty tile properties (default)
				let tileProps = {
					id: tileRaw.id
				};

				// copy all property infos
				let propsCount = (tileRaw.properties && tileRaw.properties.length) || 0;
				for (let p = 0; p < propsCount; p++) {
					let prop = tileRaw.properties[p];

					if (prop.name === "isBlocking") {
						tileProps.isBlocking = prop.value;
					} else if (prop.name === "type") {
						assert(TileTypes[prop.value] != null, `Unknown tile type '${prop.value}' for tile id '${tileProps.id}'!`, "Tileset");
						tileProps.typeName = prop.value;
					}
				}

				// track tile its ID
				_tilePropertiesByID[tileRaw.id] = tileProps;
			}

			// forward properties stored on untyped types to the TileType class
			TileTypes.init(_tilePropertiesByID);

			// release the unused data, we have copied everything we needed
			JSONCache.release("tileset16");
		}
	}
}

exposeOnWindow("Tileset", Tileset);

export default Tileset;