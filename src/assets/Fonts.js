import { log, warn, fail } from "../utils/Log.js";
import Spritesheets from "./Spritesheets.js";

// default characters (ASCII order)
const _chars = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}`;

// map of all available fonts
const _fonts = {};

/**
 * Processes all fonts defined in the manifest.
 * @param {object} allFonts the map of all fonts defined in the manifest
 */
function process(allFonts={}) {
	for (let fontName in allFonts) {
		let fontDef = allFonts[fontName];
		_process(fontName, fontDef);
	}
}

/**
 * Creates the character- and kerning-table for the given font
 */
function _process(fontName, fontDef) {

	// get the sheet which is used to render the font
	let sheet = Spritesheets.getSheet(fontDef.spritesheet);

	// sanity check
	if (!sheet) {
		fail(`The spritesheet '${fontDef.spritesheet}' defined for font '${fontName}' does not exist!`, "Fonts");
	}


	// default font object
	let font = _fonts[fontName] = {
		name: fontName,
		w: fontDef.w || sheet.w,
		h: fontDef.h || sheet.h,
		charOrder: fontDef.charOrder || _chars, // default ASCII char order as fallback
		chars: {},
		kerning: fontDef.kerning,
		_kerningTree: null,
		/**
		 * Convenience function to get the texture for the given char.
		 * @param {string} c single char
		 */
		getChar: function(c) {
			let char = this.chars[c];
			if (!char) {
				warn(`Unknown character ${c} for font ${this.name}. Character 0 will be rendered.`, "Fonts");
				char = this.chars[0];
			}
			return char;
		}
	};


	// fill the char map based on the given order (or defaulted to ASCII)
	let len = font.charOrder.length;
	for (let i = 0; i < len; i++) {
		let char = font.charOrder[i];
		font.chars[char] = {
			texture: sheet.textures[i]
		};
	}

	log(`  > [1] ${font.name}: character map built.`, "Fonts.process");

	// now we process build up the kerning table
	// we split this per character, so the look-ahead during during rendering can be sped up
	if (font.kerning) {

		font._kerningTree = {};

		for (let pair in font.kerning) {

			// fonts can define:
			// 1. a spacing value
			// 2. a default kerning value
			if (pair == "spacing" || pair == "default") {
				font._kerningTree[pair] = font.kerning[pair];
				continue;
			}

			let c0 = pair[0];
			let c1 = pair[1];

			font._kerningTree[c0] = font._kerningTree[c0] || {};
			font._kerningTree[c0][c1] = font.kerning[pair];
		}

		log(`  > [2] ${font.name}: kerning table built.`, "Fonts.process");
	} else {
		log(`  > [2] ${font.name}: no kerning table defined. Font is monospaced: ${font.h}x${font.w}.`, "Fonts.process");
	}
}

function getFont(name) {
	let font = _fonts[name];
	if (!font) {
		fail(`Font of name '${name}' does not exist!`, "fonts");
	}
	return font;
}

export default {
	process,
	getFont
};