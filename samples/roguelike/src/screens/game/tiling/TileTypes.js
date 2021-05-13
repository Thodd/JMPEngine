import TileVisuals from "./TileVisuals.js";

const TileTypes = {
	VOID: {
		name: "VOID",
		isWalkable: true,
		blocksFOV: false,
		visuals: TileVisuals.VOID
	},

	FLOOR: {
		name: "FLOOR",
		isWalkable: true,
		blocksFOV: false,
		visuals: TileVisuals.FLOOR
	},

	TREE: {
		name: "TREE",
		isWalkable: false,
		blocksFOV: true,
		visuals: TileVisuals.TREE
	}
}

export default TileTypes;