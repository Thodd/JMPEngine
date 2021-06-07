// JMP imports
import Spritesheets from "../../../../src/assets/Spritesheets.js";

const sheet = Spritesheets.getSheet("tileset");

const Constants = {
	FONT_NAME: "rlfont",

	TILE_WIDTH: sheet.w,
	TILE_HEIGHT: sheet.h,

	// the number of rooms in columns and rows
	OVERWORLD_ROOM_COLUMNS: 11,
	OVERWORLD_ROOM_ROWS: 11,

	// viewport & room size
	VIEWPORT_WIDTH: 28,
	VIEWPORT_HEIGHT: 15,

	// Rendering Layers
	Layers: {
		// 1
		// 2
		MAP: 3,
		// 4
		UI: 5
	}
};

export default Constants;