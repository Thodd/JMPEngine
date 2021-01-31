import { exposeOnWindow } from "../../../../src/utils/Helper.js";

/**
 * List of all known tile types
 */
const TileTypes = {
	GRASS: "grass",
	GRASS_CUT: "grass_cut",

	BUSH: "bush",
	BUSH_CUT: "bush_cut",

	WATER_DEEP: "water_deep",
	WATER_SHALLOW: "water_shallow",

	STAIRS: "stairs",

	CLIFF_TOP_N: "cliff_top_N",
	CLIFF_TOP_NE: "cliff_top_NE",
	CLIFF_TOP_E: "cliff_top_E",
	CLIFF_TOP_SE: "cliff_top_SE",
	CLIFF_TOP_S: "cliff_top_S",
	CLIFF_TOP_SW: "cliff_top_SW",
	CLIFF_TOP_W: "cliff_top_W",
	CLIFF_TOP_NW: "cliff_top_NW"
};

/**
 * The list of all type values (strings) are used for sanity checks on the loaded maps.
 * This helps prevent errors when designing maps via Tiled.
 */
TileTypes.ALL_TYPE_VALUES = Object.values(TileTypes);

/**
 * We track some additional tile properties in Code instead of the tileset JSON.
 * Stuff like Hitboxes are easier maintained here than in Tiled.
 */
TileTypes.ADDITIONAL_PROPERTIES = {
	"cliff_top_N": {
		hitbox: [{
			"x":0,
			"y":0,
			"w":16,
			"h":4
		}]
	},
	"cliff_top_NE": {
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
	"cliff_top_E": {
		hitbox: [{
			"x":12,
			"y":0,
			"w":4,
			"h":16
		}]
	},
	"cliff_top_SE": {
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
	"cliff_top_S": {
		hitbox: [{
			"x":0,
			"y":12,
			"w":16,
			"h":4
		}]
	},
	"cliff_top_SW": {
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
	"cliff_top_W": {
		hitbox: [{
			"x":0,
			"y":0,
			"w":4,
			"h":16
		}]
	},
	"cliff_top_NW": {
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