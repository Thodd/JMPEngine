import LeavesEffect from "../animations/effects/Leaves.js";

const Types = {
	EMPTY: {
		name: "EMPTY",
		id: 0,
		walkable: true
	},
	VOID: {
		name: "VOID",
		id: 1,
		walkable: true
	},
	FLOOR: {
		name: "FLOOR",
		id: [2, 3, 4, 5, 6],
		probability: 0.1,
		walkable: true
	},
	DIRT: {
		name: "DIRT",
		id: 4,
		walkable: true
	},
	GRASS: {
		name: "GRASS",
		id: 5,
		walkable: true
	},
	TREE: {
		name: "TREE",
		id: [64, 66],
		probability: 0.5,
		walkable: false
	},
	BUSH: {
		name: "BUSH",
		id: 70,
		walkable: false,
		destroyable: true,
		destroyEffect: LeavesEffect,
		replaceWith: "BUSH_STUMP",
		drops: true
	},
	BUSH_STUMP: {
		name: "BUSH_STUMP",
		id: 71,
		walkable: true
	},
	SIGN: {
		name: "SIGN",
		id: 67,
		walkable: false
	},
	WALL: {
		name: "WALL",
		id: [40, 41],
		probability: 0.1,
		walkable: false
	}
};

export default Types;