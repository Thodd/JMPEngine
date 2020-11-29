const Constants = {
	MAP_WIDTH:   31,
	MAP_HEIGHT:  27,

	SCREEN_HEIGHT: 15,
	SCREEN_WIDTH: 15,

	TILE_WIDTH:  16,
	TILE_HEIGHT: 16,

	Directions: {
		LEFT: "left",
		RIGHT: "right",
		UP: "up",
		DOWN: "down"
	},

	Layers: {
		TILES: 0,
		NPC: 1,
		PLAYER: 2,
		UI: 5
	},

	Colors: {
		BLACK: 0x22272a,
		GRAY_DARK: 0x424242,
		GRAY_LIGHT: 0xebe8ec,
		WHITE: 0xffffff,
		CREME: 0xfdf0d1,
		GREEN_LIGHT: 0x5dc48c,
		RED_LIGHT: 0xeb6966,
		BLUE_LIGHT: 0x52adf5,
		BROWN_LIGHT: 0xaf6a55,
		BROWN_DARK: 0x8c424b,
		YELLOW_LIGHT: 0xfadb6e
	}
};

export default Constants;