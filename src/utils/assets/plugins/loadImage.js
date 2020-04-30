/**
 * An AssetLoader plugin always has to export an async function as the default module export!
 */
export default async function(resourceObject) {
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