import { log } from "../utils/Log.js";


function load(manifest) {
	log("Loading sprites...", "AssetLoader");
	return new Promise(function(resolve) {

		var fnGetCallback = function (oResource, sType) {
			return function() {
				iResourcesToLoad--;
				log("Loaded: " + oResource.url + " (" + sType + ")", "AssetLoader");
				if (iResourcesToLoad == 0) {
					log("All sprites & fonts loaded.", "AssetLoader");
					resolve(manifest);
				}
			};
		};

		var fnLoadResources = function(sType) {
			for (var sResourceID in manifest[sType]) {
				var oResource = manifest[sType][sResourceID];
				oResource.id = sResourceID; // link id to itself

				var oRawImg = new Image();

				oResource.raw = oRawImg;

				oRawImg.src = oResource.url;
				oRawImg.onload = fnGetCallback(oResource, sType);
			}
		};


		// Spritesheets & Fonts
		// make sure we have at least an empty spritesheet & font object
		manifest.spritesheets = manifest.spritesheets || {};
		manifest.fonts = manifest.fonts || {};

		// count the number of resources to load
		var aSheets = Object.keys(manifest.spritesheets);
		var aFonts = Object.keys(manifest.fonts);
		var iResourcesToLoad = aSheets.length + aFonts.length;

		// nothing to do, no sprites used
		if (iResourcesToLoad == 0) {
			return resolve();
		}

		fnLoadResources("spritesheets");

		fnLoadResources("fonts");

		// TODO: sound
		// TODO: maps
	});
}

export default {
	load
};