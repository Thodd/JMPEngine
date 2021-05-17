import TileVisuals from "./TileVisuals.js";

const TileTypes = {
	VOID: {
		name: "VOID",
		isWalkable: true,
		blocksLight: false,
		visuals: TileVisuals.VOID
	},

	FLOOR: {
		name: "FLOOR",
		isWalkable: true,
		blocksLight: false,
		visuals: TileVisuals.FLOOR
	},

	TREE: {
		name: "TREE",
		isWalkable: false,
		blocksLight: true,
		visuals: TileVisuals.TREE
	}
}

export default TileTypes;