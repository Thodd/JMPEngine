import loadImage from "./ImageLoader.js";

import Spritesheets from "../../gfx/Spritesheets.js";


async function load(resourceObject) {
	return loadImage.load(resourceObject);
}

async function process(resourceObject) {
	return Spritesheets.process(resourceObject);
}

export default {
	load,
	process
}