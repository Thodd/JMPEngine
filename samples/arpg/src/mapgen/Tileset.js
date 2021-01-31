import { warn, assert } from "../../../../src/utils/Log.js";
import JSONCache from "../../../../src/assets/JSONCache.js";
import { exposeOnWindow } from "../../../../src/utils/Helper.js";

import TileTypes from "./TileTypes.js";

let _initialized;

// The list of tile properties, ordered by the ID.
const _tilePropertiesByID = [];

// the list of tile properties ordered by type (only known types are included).
const _tilePropertiesByType = {};

/**
 * Parses the tileset.json information for each tile.
 *
 * @param {tile} tile the tile for which the properties are parsed
 * @param {object} prop an object containing all tile properties defined in the tileset.json
 */
const parseProperty = function(tile, prop) {
	// Parse animation information if defined for the tile.
	// We do this as a string since Tiled does not support JS arrays or objects as properties...
	// ...or I'm stupid and couldn't figure out how :(
	if (prop.name === "anim_frames") {
		assert(typeof prop.value === "string", `Error detected: 'anim_frames' was not defined as a string for tile #${tile.id}.`, "Tileset");
		tile.animation = tile.animation || {};
		tile.animation.frames = prop.value.split(",").map((i) => {
			return parseInt(i);
		});
	} else if (prop.name === "anim_time") {
		if (typeof prop.value !== "number") {
			warn(`Error detected: 'anim_time' was not defined as a number for tile #${tile.id}.`, "Tileset");
		}
		tile.animation = tile.animation || {};
		tile.animation.dt = prop.value != null ? parseInt(prop.value) : 0;
	} else if (prop.name === "anim_synchronize") {
		if (typeof prop.value !== "boolean") {
			warn(`Error detected: 'anim_synchronize' was not defined as a boolean for tile #${tile.id}.`, "Tileset");
		}
		tile.animation = tile.animation || {};
		tile.animation.synchronize = prop.value || false;
	} else if (prop.name === "hitbox") {
		// a hitbox can be defined in the tileset JSON, but for most tiles it's part of the "additional-properties" (if any)
		tile.hitbox = JSON.parse(prop.value);
	} else {
		// validate type values
		if (prop.name === "type") {
			assert(TileTypes.ALL_TYPE_VALUES.indexOf(prop.value) >= 0, `Error detected: unknown type-value '${prop.value}' for tile #${tile.id}.`, "Tileset")
		}

		// standard properties, no special logic required
		tile[prop.name] = prop.value;
	}
};

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

				// empty tile info
				let tileInfo = _tilePropertiesByID[tileRaw.id] = {
					id: tileRaw.id
				};

				// copy all property infos
				let propsCount = (tileRaw.properties && tileRaw.properties.length) || 0;
				for (let p = 0; p < propsCount; p++) {
					let prop = tileRaw.properties[p];
					parseProperty(tileInfo, prop);

					// track tile by type so we can retrieve the tiles properties
					// if parseProperty() has not failed, we assume a valid tile type here
					if (prop.name === "type") {
						_tilePropertiesByType[prop.value] = _tilePropertiesByType[prop.value] || [];
						_tilePropertiesByType[prop.value].push(tileInfo);
					}
				}

				// after we have processed all properties, we make a look-up for additional properties
				let addtlProps = TileTypes.ADDITIONAL_PROPERTIES[tileInfo.type];
				if (addtlProps) {
					// we just copy over the additional props
					// BEWARE: for objects this is only a shallow copy!
					Object.assign(tileInfo, addtlProps);
				}
			}

			// release the unused data, we have copied everything we needed
			JSONCache.release("tileset16");
		}
	},

	/**
	 * Returns the properties defined in the tileset for the given tile-ID, tile-type or GameTile instance.
	 *
	 * If a tile type is used, the tile properties might be ambiguos since a tile type can be used by multiple tiles.
	 * All tiles sharing a tile-type are considered equal with respect to their properties, the only difference being their
	 * visuals.
	 * If multiple tiles for a type exist, the first entry is returned (loweset ID).
	 *
	 * @param {int|string|GameTile} t the tile-ID, tile-Type or GameTile instance for which the properties should be retrieved
	 * @returns {object} the tile's properties. Or an empty object if no properties were found.
	 */
	getProperties(t) {
		if (typeof t === "string") {
			let tiles = _tilePropertiesByType[t] || [];
			return tiles[0];
		} else if (typeof t === "number") {
			// return at least an empty object if no information is defined in the tileset
			return _tilePropertiesByID[t] || {};
		} else {
			// assume we have a tile instance
			return _tilePropertiesByID[t.id];
		}
	}
}

exposeOnWindow("Tileset", Tileset);

export default Tileset;