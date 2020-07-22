import { log, warn, fail } from "../utils/Log.js";
import Spritesheets from "./Spritesheets.js";

// supported characters (ASCII order)
const _chars = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}`;

// Default Font
const DEFAULT_JMP_FONT0 = {
	"url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqAAAAAICAYAAAAm7E1vAAAFZklEQVR4Xu1a267bSAxr/v+js8jDAKqWN8k+aQ6QvhTN3DQURdF2H3+CP8/n8/ma9ng8HnV6/Z3NUdu/1vQ9XTjnHBTP67ckVnTGJn4X6zvHE1wQ1modG1N5q2vO/RVvzhy3bhPnO/FPznI5Ynt0bA6eE8xqvbD9av30WF5novOSfRFf6m8pLn1N5ZUa65qVrutxp3lgfO/1cFf+eg7Q+Sd/m7sjHCoH1Z6I051L0x7QebpZ3+Pa6P+mf7HeM7nDNFYXpxs/eDNe3XGnRD+/c+5HQHGJ8WLKPxX1X4ZSGTNkJmogKCjXMOp5vakigUsLpZvTFLB03v00mO/osO1NoWOCRCXdU+XB5ciNV0OaNjnWAOeo/twK18RRfTnhV8ZuMrY1b8rY1didAWX3RCYh0QXHz1MLvd7RvxkH1f0cnmd8myNUI8lvjoN3m1NlTFyOUkOWcCut6qn+p1rmzp/sM5mrOOFiSsbvymFy1qfN2eThE++AfEHCm2mtsLv/mAE9AfaD65O4E4+JYFbQkAHdCFpvFC7edxHM4ZKYTdUc3FhqVJWBUFip+3Wz4uae+azQVCFtRSbhCTMhE85NDMwVs5gKEquxCR4pL6q+bN7MIPwV9hOsVX0o4+rGknq6GmfKS8aJ1JS42nLj7vx0fa8Lpp1nHnqwR2NVd9yeqF+pPVWd1fugLyVorcOKaeSmD9S9kHazeys8u9eYfIGob+PVujTvrjdffchz/a7nBPEh0fPeZ50n2Hofa0BdA580jP42IRWrClg/LzGWrsBUc1aNLknSNjFsXdJgkoafNjMmvOrtJCO9EwqFpzMcrtBQE1DcZpzpd1D7JoasNvyKNfq931HFsqmt/mm05z45D+UYrUNN19Uya3hOlF19s7eqNUZXd4rzzCA7Lm20x8XpGmDlXWrslRFhNZZo8nTOhAdbXVZ3fcdYyrO0VtIeNuGV03H2EirFr++v8u44McFJ6Uj1KK7G0Nz0DpP7ON1jvYvdBXkGt4ers39iQKsooQskpEjEKQWSJeo0APSU5JoHA367Tt2lxsmKf2pIENnQE3U3KW6d+lzOYnRFlwiDK4S790B56Hmqc7rZSIzAtCk4DtXGgPCacii5QxLTFcFWfLzSyHrupg8bCOstvo67LA9IZ91cVaNIC9KanvJto+0TDeiY1n+rh282pnLU84DOcvfdGhjWL1zdnHWvvydvVTu/kl7PtHSTh2kv2d5vq1mq/lAs7j6o57jcOa7VcYZPWmuRAU03U0WrxEmRsF6QzXPxXTGr3RgkhXk1QYo0SbErY5LG74g9IWkiFEoIr8bC8FSFmDRaxOkUFyZQh++JeZsa0O2eyZ22sai906bauTMxckpTnN4oPNm9tnumNe3mqQaXvJlyhsXdL+FS7yPqzfhE212fQON3cfAKz1I8aq+a9M0Ew6v1Pa0Hp/kdz4pR+gnecTnRpkmc9Ty2DtWnq6kk7wm3U28wrWFVd5EBVQ1cbc6AY4AlAlFjSePazutkcOKOEliFILkfM0VOJCqm2//L0mNVeypBScUg/cRXMUF4uvyqcTfmPgtPChudxfLKjEIXsX5+8n+Vev31ZoXu5N6O9hydPdg61kAm3FWfutI7pMYA3S9524W4u8lt8uBZa9LVoNpv01RrvlkcjhNMH5X2OV1MYnG6rBq8wxnhoriUaF2iSar3prqbGB9VA4neTeNkPEswqdqZ4Mxyx3rfO+rP8Z3p6rZvqi87aE9XS//rV9MFd853YN59lgLMmZhpLHfvNz3/O98j8Ck5UobQ3+I744vA70MgebhVt7q6/vch5iP+CUw+RSMdFzYG1CP6O2ZcyfvmBcydnPgPk/hQvVwM3SoAAAAASUVORK5CYII=",
	"w": 7,
	"h": 8,
	"kerning": {}
};

for (let c of _chars) {
	// wide
	if (c != "i") {
		DEFAULT_JMP_FONT0.kerning["A" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["B" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["C" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["D" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["E" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["F" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["G" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["H" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["O" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["Q" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["R" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["U" + c] = +1;
		DEFAULT_JMP_FONT0.kerning["Z" + c] = +1;
	}

	// slim
	DEFAULT_JMP_FONT0.kerning["f" + c] = -1;
	DEFAULT_JMP_FONT0.kerning["l" + c] = -1;
	DEFAULT_JMP_FONT0.kerning["t" + c] = -1;
	DEFAULT_JMP_FONT0.kerning["h" + c] = -1;
	DEFAULT_JMP_FONT0.kerning["n" + c] = -1;
	DEFAULT_JMP_FONT0.kerning["s" + c] = -1;

	// the 'i' and 'I' have to be kerned from both sides, as it is extremly slim
	DEFAULT_JMP_FONT0.kerning["I" + c] = -1;
	DEFAULT_JMP_FONT0.kerning[c + "I"] = -1;
	DEFAULT_JMP_FONT0.kerning["i" + c] = -3;
	if (["A", "B", "C", "D", "E", "F", "G", "H", "O", "Q", "R", "U", "Z"].indexOf(c) == -1) {
		DEFAULT_JMP_FONT0.kerning[c + "i"] = -1;
	}

	// special chars
	DEFAULT_JMP_FONT0.kerning[c + "'"] = -1;
}

// additional kerning values
Object.assign(DEFAULT_JMP_FONT0.kerning, {
	"spacing": 6,
	"maxPositiveKerning": 1, // needed to determine a good Text backbuffer dimension

	// upper case I has already some space in it's tile
	"AI": 0,
	"BI": 0,
	"CI": 0,
	"DI": 0,
	"GI": 0,
	"EI": 0,
	"FI": 0,
	"HI": 0,
	"OI": 0,
	"QI": 0,
	"RI": 0,
	"UI": 0,
	"ZI": 0,

	"ak": -1,

	// 'e' and 'r' nicely complement the lower-case 'a'
	"ea": -1,
	"ra": -1,

	"fi": -2,

	"hi": -2,

	// since the "i" is very slim we have to apply kerning to all "i-pairings"
	// default value is -2, but there are some combinations which look better with -3
	"il": -4,
	"ii": -3,
	"iI": -4,

	"ll": -2,
	"li": -2,
	"lt": -2,

	"ni": -2,

	"ol": -1,

	"sa": -1,
	"sc": -1,
	"sd": -1,
	"si": -2,

	"ti": -2,

	"xt": -1,
});

// map of all available fonts
const _fonts = {};

/**
 * Processes all fonts defined in the manifest.
 * @param {object} allFonts the map of all fonts defined in the manifest
 */
function process(allFonts={}, pixiResources) {
	for (let fontName in allFonts) {
		let fontDef = allFonts[fontName];

		// // check for font data given via json file
		// if (fontDef.fontdata) {
		// 	let fontData =
		// }
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
		w: sheet.w,
		h: sheet.h,
		charOrder: fontDef.charOrder || _chars, // default ASCII char order as fallback
		chars: {},
		kerning: false,
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

	log(`  > [1] ${font.name}: character map built`, "Fonts.process");

	// now we process build up the kerning table
	// we split this per character, so the look-ahead during during rendering can be sped up
	if (font.kerning) {

		font._kerningTree = {};

		for (let pair in font.kerning) {

			// special handling of spacing for fonts with kerning is handled
			if (pair == "spacing") {
				font._kerningTree["spacing"] = font.kerning[pair];
				continue;
			}

			let c0 = pair[0];
			let c1 = pair[1];

			font._kerningTree[c0] = font._kerningTree[c0] || {};
			font._kerningTree[c0][c1] = font.kerning[pair];
		}

		log(`  > [2] ${font.name}: kerning table built`, "Fonts.process");
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
	DEFAULT_JMP_FONT0,
	process,
	getFont
};