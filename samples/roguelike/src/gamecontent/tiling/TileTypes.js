import TileType from "../../engine/tiling/TileType.js";
import TileVisuals from "./TileVisuals.js";

/**
 * Map of all tile types.
 */
const TileTypes = {};

/**
 * Shorthand factory to create and track tile-types.
 * @param {object} spec tile-type definition
 */
function _create(spec) {
	let tt = new TileType(spec);
	// track all tile types in the global map.
	TileTypes[spec.name] = tt;
}


// --------------- TileType definitions begin here ---------------

_create({
	name: "FLOOR",
	isWalkable: true,
	blocksLight: false,
	visuals: TileVisuals.FLOOR
});

_create({
	name: "TREE",
	isWalkable: false,
	blocksLight: true,
	visuals: TileVisuals.TREE
});


export default TileTypes;