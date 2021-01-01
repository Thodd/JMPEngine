import Manifest from "../../../src/assets/Manifest.js";

const Constants = {
	MAP_WIDTH:   31,
	MAP_HEIGHT:  27,

	TILE_WIDTH:  10,
	TILE_HEIGHT: 10,

	Directions: {
		LEFT: "left",
		RIGHT: "right",
		UP: "up",
		DOWN: "down"
	},

	Layers: {
		TILES:    0,
		BELOW_ACTORS: 1,
		NPC:      2,
		PLAYER:   3,
		ABOVE_ACTORS: 4,
		UI_BG:    6,
		UI_TEXT:  7
	},

	Colors: {
		BLACK: 0x22272a,
		GRAY_DARK: 0x424242,
		GRAY_LIGHT: 0xebe8ec,
		WHITE: 0xffffff,
		CREME: 0xfdf0d1,
		GREEN_LIGHT: 0x5dc48c,
		GREEN_DARK: 0x247458,
		RED_LIGHT: 0xec4b00,
		RED_DARK: 0xbe2632,
		BLUE_LIGHT: 0x38a8f2,
		BROWN_LIGHT: 0xaf6a55,
		BROWN_DARK: 0x8c424b,
		YELLOW_LIGHT: 0xf7d85d,
		YELLOW_DARK: 0xfac800
	},

	Events: {
		// events from game LOGIC -> UI
		LOGIC_UPDATE_STATS: "logic_update_hp",
		LOGIC_UPDATE_BACKPACK: "logic_update_backpack",
		LOGIC_PLAYER_TURN_ENDED: "logic_player_turn_ended",

		// events from UI -> LOGIC
		UI_UPDATE_BACKPACK: "ui_update_backpack"
	},

	EquipmentSlots: {
		MELEE: "melee",
		RANGED: "ranged",
		QUICK1: "quick1",
		QUICK2: "quick2"
	}
};

// We can only calculate the screen width measured in tiles with the actual canvas size from the manifest
Constants.SCREEN_WIDTH_IN_TILES = Manifest.get("/w") / Constants.TILE_WIDTH;
Constants.SCREEN_HEIGHT_IN_TILES = Manifest.get("/h") / Constants.TILE_HEIGHT;

// keep half of it, because it's widely used to center stuff on the screen, e.g. player camera
Constants.SCREEN_WIDTH_IN_TILES_HALF = Math.floor(Constants.SCREEN_WIDTH_IN_TILES / 2);
Constants.SCREEN_HEIGHT_IN_TILES_HALF = Math.floor(Constants.SCREEN_HEIGHT_IN_TILES / 2);

export default Constants;