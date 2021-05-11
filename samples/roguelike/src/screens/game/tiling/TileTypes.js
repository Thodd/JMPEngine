import TileVisuals from "./TileVisuals.js";

const TileTypes = {
	VOID: {
		name: "VOID",
		walkable: true,
		blocksFOV: false,
		visuals: TileVisuals.VOID
	},

	FLOOR: {
		name: "FLOOR",
		walkable: true,
		blocksFOV: false,
		visuals: TileVisuals.FLOOR
	},

	TREE: {
		name: "TREE",
		walkable: false,
		blocksFOV: true,
		visuals: TileVisuals.TREE
	}
}

export default TileTypes;