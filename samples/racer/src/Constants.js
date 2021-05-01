import Manifest from "../../../src/assets/Manifest.js";

/**
 * Constants are either defined for this project or taken from from https://github.com/jakesgordon/javascript-racer/
 * MIT License
 */
const Constants = {
	SCREEN_WIDTH: Manifest.get("/w"),
	SCREEN_HEIGHT: Manifest.get("/h"),
	SCREEN_SCALE: Manifest.get("/scale"),

	COLORS: {
		TREE: 0x005108,
		FOG: 0x2f484e,
		LIGHT: { road: 0x939393, grass: 0x9ec725, rumble: 0xFFFFFF, lane: 0xffffff },
		DARK: { road: 0x909090, grass: 0x98bf23, rumble: 0xbe2632 },
		TUNNEL_LIGHT: { road: 0x737373, grass: 0x2f484e, rumble: 0xDDDDDD, lane: 0xDDDDDD },
		TUNNEL_DARK: { road: 0x707070, grass: 0x2f484e, rumble: 0x7d1820 },
		START: { road: 0xFFFFFF, grass: 0xFFFFFF, rumble: 0xFFFFFF },
		GOAL: { road: 0x000000, grass: 0x000000, rumble: 0x000000 }
	},

	ROAD: {
		LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
		HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
		CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 }
	},

	NUMBER_OF_LANES: 2,
	ROAD_WIDTH: 700,
	SEGMENT_LENGTH: 100,
	RUMBLE_LENGTH : 4,
	FOV: 100,
	RENDER_DISTANCE: 300,
	FOG_THICKNESS: 5,

	LAYERS: {
		TRACK: 0,
		THINGS: 1,
		CAR_FRONT: 2,
		CAR_BACK: 3,
		UI: 4
	}
};

// Calculated values
Constants.FRAME_TIME = 16.7;
Constants.CENTRIFUGAL_FORCE = 0.65;
Constants.SPEED_MAX = (Constants.SEGMENT_LENGTH * 1.7) / Constants.FRAME_TIME;
Constants.ACCELERATION = Constants.SPEED_MAX/3000;
Constants.DECELERATION = -Constants.SPEED_MAX/2000;
Constants.OFF_ROAD_SPEED_LIMIT = Constants.SPEED_MAX/3000;
Constants.BREAKING = -Constants.SPEED_MAX/1000;


export default Constants;