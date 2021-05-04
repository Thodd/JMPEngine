import Spritesheets from "../../../src/assets/Spritesheets.js";

const sheet = Spritesheets.getSheet("tileset");

const Constants = {
	FONT_NAME: "rlfont",

	TILE_WIDTH: sheet.w,
	TILE_HEIGHT: sheet.h,

	MAP_WIDTH: 100,
	MAP_HEIGHT: 100,

	MAP_VIEWPORT_WIDTH: 31,
	MAP_VIEWPORT_HEIGHT: 31
};

export default Constants;