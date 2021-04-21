import Constants from "../Constants.js";
import LeavesEffect from "../animations/effects/Leaves.js";

const Types = {
	EMPTY: {
		name: "EMPTY",
		id: 0,
		walkable: true
	},
	VOID: {
		name: "VOID",
		id: 0,
		walkable: true
	},
	FLOOR: {
		name: "FLOOR",
		text: {
			name: "Floor",
			innerName: "a patch of grass",
			flavor: "Yep. That's the ground alright."
		},
		id: [32, 33],
		probability: 0.1,
		colors: {
			fg: Constants.Colors.GREEN_DARK
		},
		walkable: true
	},
	TREE: {
		name: "TREE",
		text: {
			name: "Tree",
			innerName: "a single tree",
			flavor: "The bork is overgrown with moss."
		},
		id: [96, 97, 98, 99, 100, 101],
		probability: 0.5,
		colors: {
			fg: Constants.Colors.GREEN_LIGHT
		},
		walkable: false
	},
	BUSH: {
		name: "BUSH",
		text: {
			name: "Bush",
			innerName: "a bush",
			flavor: "Looks like it can be cut down rather easily."
		},
		id: 104,
		colors: {
			fg: Constants.Colors.GREEN_LIGHT
		},
		walkable: false,
		destroyable: true,
		destroyEffect: LeavesEffect,
		replaceWith: "BUSH_STUMP",
		drops: true
	},
	BUSH_STUMP: {
		name: "BUSH_STUMP",
		id: 39,
		colors: {
			fg: Constants.Colors.BROWN_DARK
		},
		walkable: true
	},
	SIGN: {
		name: "SIGN",
		id: [128, 129],
		probability: 0.5,
		colors: {
			fg: Constants.Colors.BROWN_LIGHT
		},
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