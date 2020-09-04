import JSONCache from "../../../../src/assets/JSONCache.js";

let _initialized;

const _tileProperties = [];

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
				let tile = _tileProperties[tileRaw.id] = {};

				// copy all property infos
				let propsCount = (tileRaw.properties && tileRaw.properties.length) || 0;
				for (let p = 0; p < propsCount; p++) {
					let prop = tileRaw.properties[p];

					// Parse animation information if defined for the tile.
					// We do this as a string since Tiled does not support JS arrays or objects as properties...
					// ...or I'm stupid and couldn't figure out how :(
					if (prop.name === "anim_frames") {
						tile.animation = tile.animation || {};
						tile.animation.frames = prop.value.split(",").map((i) => {
							return parseInt(i);
						});
					} else if (prop.name === "anim_time") {
						tile.animation = tile.animation || {};
						tile.animation.dt = prop.value != null ? parseInt(prop.value) : 0;
					} else if (prop.name === "anim_synchronize") {
						tile.animation = tile.animation || {};
						tile.animation.synchronize = prop.value || false;
					} else {
						// standard properties, no special logic required
						tile[prop.name] = prop.value;
					}

				}
			}

			// release the unused data, we have copied everything we needed
			JSONCache.release("tileset16");
		}
	},

	/**
	 * Returns the properties defined in the tileset for the given tile-ID.
	 * @param {int} tileId the tile-ID for which the properties should be retrieved
	 * @returns {object} the tile's properties. Or an empty object if no properties were found.
	 */
	getProperties(tileId) {
		// return at least an empty object if no information is defined in the tileset
		let ti = _tileProperties[tileId] || {};
		return ti;
	}
}

export default Tileset;