import { log } from "../utils/Log.js";
import ColorTools from "../gfx/ColorTools.js";

// Default Font
const DEFAULT_JMP_FONT0 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqAAAAAICAYAAAAm7E1vAAAFZklEQVR4Xu1a267bSAxr/v+js8jDAKqWN8k+aQ6QvhTN3DQURdF2H3+CP8/n8/ma9ng8HnV6/Z3NUdu/1vQ9XTjnHBTP67ckVnTGJn4X6zvHE1wQ1modG1N5q2vO/RVvzhy3bhPnO/FPznI5Ynt0bA6eE8xqvbD9av30WF5novOSfRFf6m8pLn1N5ZUa65qVrutxp3lgfO/1cFf+eg7Q+Sd/m7sjHCoH1Z6I051L0x7QebpZ3+Pa6P+mf7HeM7nDNFYXpxs/eDNe3XGnRD+/c+5HQHGJ8WLKPxX1X4ZSGTNkJmogKCjXMOp5vakigUsLpZvTFLB03v00mO/osO1NoWOCRCXdU+XB5ciNV0OaNjnWAOeo/twK18RRfTnhV8ZuMrY1b8rY1didAWX3RCYh0QXHz1MLvd7RvxkH1f0cnmd8myNUI8lvjoN3m1NlTFyOUkOWcCut6qn+p1rmzp/sM5mrOOFiSsbvymFy1qfN2eThE++AfEHCm2mtsLv/mAE9AfaD65O4E4+JYFbQkAHdCFpvFC7edxHM4ZKYTdUc3FhqVJWBUFip+3Wz4uae+azQVCFtRSbhCTMhE85NDMwVs5gKEquxCR4pL6q+bN7MIPwV9hOsVX0o4+rGknq6GmfKS8aJ1JS42nLj7vx0fa8Lpp1nHnqwR2NVd9yeqF+pPVWd1fugLyVorcOKaeSmD9S9kHazeys8u9eYfIGob+PVujTvrjdffchz/a7nBPEh0fPeZ50n2Hofa0BdA580jP42IRWrClg/LzGWrsBUc1aNLknSNjFsXdJgkoafNjMmvOrtJCO9EwqFpzMcrtBQE1DcZpzpd1D7JoasNvyKNfq931HFsqmt/mm05z45D+UYrUNN19Uya3hOlF19s7eqNUZXd4rzzCA7Lm20x8XpGmDlXWrslRFhNZZo8nTOhAdbXVZ3fcdYyrO0VtIeNuGV03H2EirFr++v8u44McFJ6Uj1KK7G0Nz0DpP7ON1jvYvdBXkGt4ers39iQKsooQskpEjEKQWSJeo0APSU5JoHA367Tt2lxsmKf2pIENnQE3U3KW6d+lzOYnRFlwiDK4S790B56Hmqc7rZSIzAtCk4DtXGgPCacii5QxLTFcFWfLzSyHrupg8bCOstvo67LA9IZ91cVaNIC9KanvJto+0TDeiY1n+rh282pnLU84DOcvfdGhjWL1zdnHWvvydvVTu/kl7PtHSTh2kv2d5vq1mq/lAs7j6o57jcOa7VcYZPWmuRAU03U0WrxEmRsF6QzXPxXTGr3RgkhXk1QYo0SbErY5LG74g9IWkiFEoIr8bC8FSFmDRaxOkUFyZQh++JeZsa0O2eyZ22sai906bauTMxckpTnN4oPNm9tnumNe3mqQaXvJlyhsXdL+FS7yPqzfhE212fQON3cfAKz1I8aq+a9M0Ew6v1Pa0Hp/kdz4pR+gnecTnRpkmc9Ty2DtWnq6kk7wm3U28wrWFVd5EBVQ1cbc6AY4AlAlFjSePazutkcOKOEliFILkfM0VOJCqm2//L0mNVeypBScUg/cRXMUF4uvyqcTfmPgtPChudxfLKjEIXsX5+8n+Vev31ZoXu5N6O9hydPdg61kAm3FWfutI7pMYA3S9524W4u8lt8uBZa9LVoNpv01RrvlkcjhNMH5X2OV1MYnG6rBq8wxnhoriUaF2iSar3prqbGB9VA4neTeNkPEswqdqZ4Mxyx3rfO+rP8Z3p6rZvqi87aE9XS//rV9MFd853YN59lgLMmZhpLHfvNz3/O98j8Ck5UobQ3+I744vA70MgebhVt7q6/vch5iP+CUw+RSMdFzYG1CP6O2ZcyfvmBcydnPgPk/hQvVwM3SoAAAAASUVORK5CYII=";

// supported characters (ASCII order)
const _chars = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}`;

/**
 * Creates the Font tileset for the given font.
 */
function process(font) {
	font.chars = {};

	for (let x = 0; x < _chars.length; x++) {
		let charCanvas = document.createElement("canvas");
		charCanvas.width = font.w;
		charCanvas.height = font.h;
		let ctx = charCanvas.getContext("2d");
		ctx.drawImage(font.raw, x * font.w, 0, font.w, font.h, 0, 0, font.w, font.h);
		// map for the char colors
		// IMPORTANT: the font file has a couple of empty spaces for additions in the future
		// these empty spaces will be written to the "undefined" slot of the font.chars map
		font.chars[_chars[x]] = {
			default: charCanvas
		};
	}
	log(`  > done: ${font.name}`, "GFX.Fonts");
}

/**
 * Gets the given char in the wanted color.
 * The colored char canvas is cached.
 */
function getChar(oFont, c, color) {
	let oChar = oFont.chars[c];
	if (color) {
		if (!oChar[color]) {
			oChar[color] = ColorTools.colorizeCanvas(oChar.default, color);
		}
		return oChar[color];
	} else {
		// no color tinting given, then we return the default
		// typically used for already colored fonts
		return oChar.default;
	}
}

export default {
	DEFAULT_JMP_FONT0,
	process,
	getChar
};