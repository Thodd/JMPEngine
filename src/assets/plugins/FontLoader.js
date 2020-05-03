import loadImage from "./ImageLoader.js";

import Fonts from "../../gfx/Fonts.js";

async function load(resourceObject) {
	return loadImage.load(resourceObject);
}

async function process(resourceObject) {
	return Fonts.process(resourceObject);
}

export default {
	load,
	process
}