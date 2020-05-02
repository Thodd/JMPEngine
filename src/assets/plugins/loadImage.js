/**
 * Asynchronously loads an image resource.
 * Triggered once for all resources defined in an <code>AssetLoader.load</code> call.
 *
 * @param {object} resourceObject resource definition containing the image url (as given to the AssetLoader)
 */
async function load(resourceObject) {
	// the async load plugin function has to return a Promise
	return new Promise(function(resolve) {
		var raw = new Image();
		raw.src = resourceObject.url;
		raw.onload = function () {
			// example: you can add additional information to the resourceObject, e.g. parsed content
			// for simple images the raw content is enough
			resourceObject.raw = raw;
			// always resolve with the resourceObject!
			resolve(resourceObject);
		};
	});
}

/**
 * Processes the given resource object, e.g. by splitting the spritesheet into single images.
 */
async function process() {}

/**
 * An AssetLoader plugin always has to export two async functions:
 * 1. load: loads the asset
 * 2. process: processes the asset, e.g. splitting spritesheets
 */
export default {
	load,
	process
}