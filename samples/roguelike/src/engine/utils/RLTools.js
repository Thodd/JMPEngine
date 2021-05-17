import Constants from "../../gamecontent/Constants.js";
import Fonts from "../../../../../src/assets/Fonts.js";

// create char <-> id mapping
const _font = Fonts.getFont(Constants.FONT_NAME);
const _char2id = {};
const _id2char = {};
for (let i = 0; i < _font.charOrder.length; i++) {
	let char = _font.charOrder[i];
	_char2id[char] = i;
	_id2char[i] = char;
}

/**
 * Translates a grid position X coordinate in a screen pixel position.
 * @param {int} x x-coordinate in grid
 * @returns x coordinate in pixels
 */
function xx(x) {
	return x * Constants.TILE_WIDTH;
}

/**
 * Translates a grid position Y coordinate in a screen pixel position.
 * @param {int} y y-coordinate in grid
 * @returns y coordinate in pixels
 */
function yy(y) {
	return y * Constants.TILE_HEIGHT;
}

/**
 * Translates a given character (string) to a tile-id in the CP437 spritesheet/tileset.
 * @param {string} c character string to translate into tile-id
 * @returns {int} the tile-id for the given character
 */
function char2id(c) {
	return _char2id[c];
}

/**
 * Translates a tile-id from the CP437 spritesheet into the corresponding character (string).
 * @param {int} id tile-id to translate to a character (string)
 * @returns {string} the character to the given tile-id
 */
function id2char(id) {
	return _id2char[id];
}

export {
	xx,
	yy,
	char2id,
	id2char
};