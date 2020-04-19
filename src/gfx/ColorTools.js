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
function parseHexColorToRGB(sHex) {
	sHex = sHex.substring(1, sHex.length);
	return {
		r: parseInt(sHex[0] + sHex[1], 16),
		g: parseInt(sHex[2] + sHex[3], 16),
		b: parseInt(sHex[4] + sHex[5], 16)
	};
}

/**
 * Parses an RGBA color statement to a javascript object with r/g/b/a values from 0 to 255.
 * @public
 */
function parseRGBA(sRGBA) {
	var sColorValues = sRGBA.substring(5, sRGBA.length - 1);
	var aColors = sColorValues.split(",");
	return {
		r: parseInt(aColors[0], 10),
		g: parseInt(aColors[1], 10),
		b: parseInt(aColors[2], 10),
		a: parseFloat(aColors[3]),
	};
}

/**
 * Colors all white pixels in the given src canvas with the given color value.
 * @public
 */
function colorizeCanvas(oSrcCanvas, sColor) {
	sColor = sColor || "#FF0085";

	var oRGB = parseColorString(sColor);

	// create new target canvas
	var oTarget = document.createElement("canvas");
	oTarget.width = oSrcCanvas.width;
	oTarget.height = oSrcCanvas.height;

	// get the raw data of the src
	var oSrcData = oSrcCanvas.getContext("2d").getImageData(0, 0, oSrcCanvas.width, oSrcCanvas.height);
	var oSrcRaw = oSrcData.data;

	for (var i = 0, iPixelCount = oSrcRaw.length; i < iPixelCount; i += 4) {
		// mix colors:
		// (original color in % of 255) * new Color
		// white will become the new color, all other colors will be toned down depending on their distance to 255
		oSrcRaw[i  ] = (oSrcRaw[i  ] / 255) * oRGB.r;
		oSrcRaw[i+1] = (oSrcRaw[i+1] / 255) * oRGB.g;
		oSrcRaw[i+2] = (oSrcRaw[i+2] / 255) * oRGB.b;
		oSrcRaw[i+3] = oSrcRaw[i+3]; // alpha is not touched
	}

	// write the tinted src data to the target canvas
	oTarget.getContext("2d").putImageData(oSrcData, 0, 0);

	return oTarget;
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