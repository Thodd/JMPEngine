import { log } from "../utils/Log.js";
import ColorTools from "../gfx/ColorTools.js";

// supported characters (ASCII order)
const _chars = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}`;

// Default Font
const DEFAULT_JMP_FONT0 = {
	"url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqAAAAAICAYAAAAm7E1vAAAFZklEQVR4Xu1a267bSAxr/v+js8jDAKqWN8k+aQ6QvhTN3DQURdF2H3+CP8/n8/ma9ng8HnV6/Z3NUdu/1vQ9XTjnHBTP67ckVnTGJn4X6zvHE1wQ1modG1N5q2vO/RVvzhy3bhPnO/FPznI5Ynt0bA6eE8xqvbD9av30WF5novOSfRFf6m8pLn1N5ZUa65qVrutxp3lgfO/1cFf+eg7Q+Sd/m7sjHCoH1Z6I051L0x7QebpZ3+Pa6P+mf7HeM7nDNFYXpxs/eDNe3XGnRD+/c+5HQHGJ8WLKPxX1X4ZSGTNkJmogKCjXMOp5vakigUsLpZvTFLB03v00mO/osO1NoWOCRCXdU+XB5ciNV0OaNjnWAOeo/twK18RRfTnhV8ZuMrY1b8rY1didAWX3RCYh0QXHz1MLvd7RvxkH1f0cnmd8myNUI8lvjoN3m1NlTFyOUkOWcCut6qn+p1rmzp/sM5mrOOFiSsbvymFy1qfN2eThE++AfEHCm2mtsLv/mAE9AfaD65O4E4+JYFbQkAHdCFpvFC7edxHM4ZKYTdUc3FhqVJWBUFip+3Wz4uae+azQVCFtRSbhCTMhE85NDMwVs5gKEquxCR4pL6q+bN7MIPwV9hOsVX0o4+rGknq6GmfKS8aJ1JS42nLj7vx0fa8Lpp1nHnqwR2NVd9yeqF+pPVWd1fugLyVorcOKaeSmD9S9kHazeys8u9eYfIGob+PVujTvrjdffchz/a7nBPEh0fPeZ50n2Hofa0BdA580jP42IRWrClg/LzGWrsBUc1aNLknSNjFsXdJgkoafNjMmvOrtJCO9EwqFpzMcrtBQE1DcZpzpd1D7JoasNvyKNfq931HFsqmt/mm05z45D+UYrUNN19Uya3hOlF19s7eqNUZXd4rzzCA7Lm20x8XpGmDlXWrslRFhNZZo8nTOhAdbXVZ3fcdYyrO0VtIeNuGV03H2EirFr++v8u44McFJ6Uj1KK7G0Nz0DpP7ON1jvYvdBXkGt4ers39iQKsooQskpEjEKQWSJeo0APSU5JoHA367Tt2lxsmKf2pIENnQE3U3KW6d+lzOYnRFlwiDK4S790B56Hmqc7rZSIzAtCk4DtXGgPCacii5QxLTFcFWfLzSyHrupg8bCOstvo67LA9IZ91cVaNIC9KanvJto+0TDeiY1n+rh282pnLU84DOcvfdGhjWL1zdnHWvvydvVTu/kl7PtHSTh2kv2d5vq1mq/lAs7j6o57jcOa7VcYZPWmuRAU03U0WrxEmRsF6QzXPxXTGr3RgkhXk1QYo0SbErY5LG74g9IWkiFEoIr8bC8FSFmDRaxOkUFyZQh++JeZsa0O2eyZ22sai906bauTMxckpTnN4oPNm9tnumNe3mqQaXvJlyhsXdL+FS7yPqzfhE212fQON3cfAKz1I8aq+a9M0Ew6v1Pa0Hp/kdz4pR+gnecTnRpkmc9Ty2DtWnq6kk7wm3U28wrWFVd5EBVQ1cbc6AY4AlAlFjSePazutkcOKOEliFILkfM0VOJCqm2//L0mNVeypBScUg/cRXMUF4uvyqcTfmPgtPChudxfLKjEIXsX5+8n+Vev31ZoXu5N6O9hydPdg61kAm3FWfutI7pMYA3S9524W4u8lt8uBZa9LVoNpv01RrvlkcjhNMH5X2OV1MYnG6rBq8wxnhoriUaF2iSar3prqbGB9VA4neTeNkPEswqdqZ4Mxyx3rfO+rP8Z3p6rZvqi87aE9XS//rV9MFd853YN59lgLMmZhpLHfvNz3/O98j8Ck5UobQ3+I744vA70MgebhVt7q6/vch5iP+CUw+RSMdFzYG1CP6O2ZcyfvmBcydnPgPk/hQvVwM3SoAAAAASUVORK5CYII=",
	"w": 7,
	"h": 8,
	"kerning": { // kerning values
		"spacing": 6,
		"AP": 1,

		"En": 1,

		"hi": -1,

		// since the "i" is very slim we have to apply kerning to all "i-pairings"
		// default value is -2, but there are some combinations which look better with -3
		"ic": -3,
		"il": -3,
		"it": -3,

		"li": -2,
		"ll": -2,

		"nc": -1,
		"nd": -1,
		"ng": -1,
		"ni": -1,
		"nt": -1,

		"ol": -1,

		"pi": -1,
		"PI": -1,

		"wi": -1,

		"ri": -1,

		"sa": -1,
		"sc": -1,
		"sd": -1,
		"si": -2,

		"xt": -1,
	}
};

// apply kerning values for the following characters: [f, i, l, t, I]
// some the lower-case characters are pretty slim...
for (let c of _chars) {
	// we skip those values which have been predefined
	DEFAULT_JMP_FONT0.kerning["f" + c] = DEFAULT_JMP_FONT0.kerning["f" + c] || -1;
	DEFAULT_JMP_FONT0.kerning["I" + c] = DEFAULT_JMP_FONT0.kerning["I" + c] || -1;
	DEFAULT_JMP_FONT0.kerning["i" + c] = DEFAULT_JMP_FONT0.kerning["i" + c] || -2;
	DEFAULT_JMP_FONT0.kerning["l" + c] = DEFAULT_JMP_FONT0.kerning["l" + c] || -1;
	DEFAULT_JMP_FONT0.kerning["t" + c] = DEFAULT_JMP_FONT0.kerning["t" + c] || -1;
}

/**
 * Creates the Font tileset for the given font.
 */
function process(font) {
	font.chars = {};

	let charOrder = font.charOrder || _chars;

	let len = charOrder.length;

	for (let x = 0; x < len; x++) {
		let charCanvas = document.createElement("canvas");
		charCanvas.width = font.w;
		charCanvas.height = font.h;
		let ctx = charCanvas.getContext("2d");
		ctx.drawImage(font.raw, x * font.w, 0, font.w, font.h, 0, 0, font.w, font.h);
		// map for the char colors
		// IMPORTANT: the font file has a couple of empty spaces for additions in the future
		// these empty spaces will be written to the "undefined" slot of the font.chars map
		font.chars[charOrder[x]] = {
			default: charCanvas
		};
	}
	log(`  > [1] ${font.name}: character splitting`, "Fonts.process");

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

		log(`  > [2] ${font.name}: building kerning table`, "Fonts.process");
	}
}

/**
 * Gets the given char in the wanted color.
 * The colored char canvas is cached.
 */
function getChar(font, c, color) {
	let char = font.chars[c];
	if (color) {
		if (!char[color]) {
			char[color] = ColorTools.colorizeCanvas(char.default, color);
		}
		return char[color];
	} else {
		// no color tinting given, then we return the default
		// typically used for already colored fonts
		return char.default;
	}
}

export default {
	DEFAULT_JMP_FONT0,
	process,
	getChar
};