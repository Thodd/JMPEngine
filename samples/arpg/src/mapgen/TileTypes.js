import { exposeOnWindow } from "../../../../src/utils/Helper.js";

// mapping of TileTypes by ID
// Also contains untyped Tile properties, e.g. "isBlocking" values.
let _tilePropertiesByID = [];

/**
 * List of all known tile types.
 * The base ID of the tile in the Tileset will be injected automatically.
 */
const TileTypes = {
	/**
	 * Initialize the TileTypes.
	 * Called only once during Tileset initialization.
	 * @param {object[]} tilePropertiesByID an array containing the tile properties orderd by ID
	 */
	init(tilePropertiesByID) {
		_tilePropertiesByID = tilePropertiesByID;

		tilePropertiesByID.forEach((tileProps, id) => {
			let staticDef = TileTypes[tileProps.typeName];

			// mix static type definition into the "by-id" mapping
			Object.assign(tileProps, staticDef);

			// inject IDs into static definitions
			if (staticDef) {
				staticDef.id = staticDef.id || id;
			}
		});
	},

	/**
	 * Returns the properties defined in the tileset for the given tile-ID or GameTile instance.
	 *
	 * @param {int|GameTile} t the tile-ID or GameTile instance for which the properties should be retrieved
	 * @returns {object} the tile's properties or an empty object if none were found.
	 */
	getProperties(t) {
		let id = t;
		// GameTile -> get ID
		if (t && typeof t === "object") {
			id = t.id;
		}
		return _tilePropertiesByID[id] || {};
	},


	/**
	 * From here on we store all Tile properties by their type name.
	 */

	GRASS: {
		typeName: "GRASS",
		destroyable: true,
		destroyed_replacement: "GRASS_CUT"
	},
	GRASS_CUT: {typeName: "GRASS_CUT"},

	BUSH: {
		typeName: "BUSH",
		destroyable: true,
		destroyed_replacement: "BUSH_CUT"
	},
	BUSH_CUT: {typeName: "BUSH_CUT"},

	WATER_DEEP: {
		typeName: "WATER_DEEP",
		animation: {
			frames: [560,561,560,562],
			dt: 15,
			synchronize: true
		}
	},
	WATER_SHALLOW: {
		typeName: "WATER_SHALLOW",
		animation: {
			frames: [600,601],
			dt: 30,
			synchronize: true
		}
	},

	FLOWERS: {
		typeName: "FLOWERS",
		animation: {
			frames: [3,4,5,4],
			dt: 30,
			synchronize: false,
		}
	},

	STAIRS: {typeName: "STAIRS"},

	STONE_SLAB_LOW: {
		typeName: "STONE_SLAB_LOW",
		hitbox: [{x: 0, y: 4, w: 16, h: 12}]
	},

	FENCE_SINGLE_RIGHT: {
		typeName: "FENCE_SINGLE_RIGHT",
		hitbox: [{
			"x": 8,
			"y": 0,
			"w": 8,
			"h": 16
		}]
	},

	FENCE_SINGLE_LEFT: {
		typeName: "FENCE_SINGLE_LEFT",
		hitbox: [{
			"x": 0,
			"y": 0,
			"w": 8,
			"h": 16
		}]
	},

	CLIFF_TOP_N: {
		typeName: "CLIFF_TOP_N",
		hitbox: [{
			"x":0,
			"y":0,
			"w":16,
			"h":4
		}]
	},

	CLIFF_TOP_NE: {
		typeName: "CLIFF_TOP_NE",
		hitbox: [{
			"x":0,
			"y":0,
			"w":16,
			"h":4
		},
		{
			"x":12,
			"y":0,
			"w":4,
			"h":16
		}]
	},

	CLIFF_TOP_E: {
		typeName: "CLIFF_TOP_E",
		hitbox: [{
			"x":12,
			"y":0,
			"w":4,
			"h":16
		}]
	},

	CLIFF_TOP_SE: {
		typeName: "CLIFF_TOP_SE",
		hitbox: [{
			"x":12,
			"y":0,
			"w":4,
			"h":16
		},
		{
			"x":0,
			"y":12,
			"w":16,
			"h":4
		}]
	},

	CLIFF_TOP_S: {
		typeName: "CLIFF_TOP_S",
		hitbox: [{
			"x":0,
			"y":12,
			"w":16,
			"h":4
		}]
	},

	CLIFF_TOP_SW: {
		typeName: "CLIFF_TOP_SW",
		hitbox: [{
			"x":0,
			"y":0,
			"w":4,
			"h":16
		},
		{
			"x":0,
			"y":12,
			"w":16,
			"h":4
		}]
	},

	CLIFF_TOP_W: {
		typeName: "CLIFF_TOP_W",
		hitbox: [{
			"x":0,
			"y":0,
			"w":4,
			"h":16
		}]
	},

	CLIFF_TOP_NW: {
		typeName: "CLIFF_TOP_NW",
		hitbox: [{
			"x":0,
			"y":0,
			"w":16,
			"h":4
		},
		{
			"x":0,
			"y":0,
			"w":4,
			"h":16
		}]
	}
};

exposeOnWindow("TileTypes", TileTypes);

export default TileTypes;