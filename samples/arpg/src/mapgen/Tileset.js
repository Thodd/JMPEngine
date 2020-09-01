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
					tile[prop.name] = prop.value;
				}
			}

			// release the unused data, we have copied everything we needed
			JSONCache.release("tileset16");
		}
	},

	getProperties(tileId) {
		let ti = _tileProperties[tileId];
		return ti;
	}
}

export default Tileset;