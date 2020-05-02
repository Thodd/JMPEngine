// a cache for already parsed colors
// optimizes the access a bit
const colorCache = {
	"default": {r: 255, g: 255, b: 255, a:255}
};

/**
 * Parses a color string. Either hex or rgba.
 * @public
 */
function parseColorString(color) {
	// look up cache first
	if (colorCache[color]) {
		return colorCache[color];
	}

	if (color[0] === "#") {
		colorCache[color] = parseHexColorToRGB(color);
	} else if (color.substring(0, 4) === "rgba") {
		colorCache[color] = parseRGBA(color);
	} else {
		// unknown color coding (?)
		color = "default";
	}

	return colorCache[color];
}

/**
 * Parses a hex color value (e.g. #FF0000) to a javascript object containing r/g/b/a values from 0 to 255.
 * @public
 */
function parseHexColorToRGB(hex) {
	hex = hex.substring(1, hex.length);
	return {
		r: parseInt(hex[0] + hex[1], 16),
		g: parseInt(hex[2] + hex[3], 16),
		b: parseInt(hex[4] + hex[5], 16)
	};
}

/**
 * Parses an RGBA color statement to a javascript object with r/g/b/a values from 0 to 255.
 * @public
 */
function parseRGBA(rgba) {
	var colorValues = rgba.substring(5, rgba.length - 1);
	var colorParts = colorValues.split(",");
	return {
		r: parseInt(colorParts[0], 10),
		g: parseInt(colorParts[1], 10),
		b: parseInt(colorParts[2], 10),
		a: parseFloat(colorParts[3]),
	};
}

/**
 * Colors all white pixels in the given src canvas with the given color value.
 * @public
 */
function colorizeCanvas(srcCanvas, color) {
	color = color || "#FF0085";

	var RGBAValues = parseColorString(color);

	// create new target canvas
	var target = document.createElement("canvas");
	target.width = srcCanvas.width;
	target.height = srcCanvas.height;

	// get the raw data of the src
	var srcData = srcCanvas.getContext("2d").getImageData(0, 0, srcCanvas.width, srcCanvas.height);
	var srcRaw = srcData.data;

	for (var i = 0, iPixelCount = srcRaw.length; i < iPixelCount; i += 4) {
		// mix colors:
		// (original color in % of 255) * new Color
		// white will become the new color, all other colors will be toned down depending on their distance to 255
		srcRaw[i  ] = (srcRaw[i  ] / 255) * RGBAValues.r;
		srcRaw[i+1] = (srcRaw[i+1] / 255) * RGBAValues.g;
		srcRaw[i+2] = (srcRaw[i+2] / 255) * RGBAValues.b;
		srcRaw[i+3] = srcRaw[i+3]; // alpha is not touched
	}

	// write the tinted src data to the target canvas
	target.getContext("2d").putImageData(srcData, 0, 0);

	return target;
}

// single function export
export {
	parseColorString,
	parseHexColorToRGB,
	parseRGBA,
	colorizeCanvas
};

// block API export
export default {
	parseColorString,
	parseHexColorToRGB,
	parseRGBA,
	colorizeCanvas
};