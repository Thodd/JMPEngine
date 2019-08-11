import { log } from "../utils/Log.js";


function load(manifest) {
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

		// count the number of resources to load
		var aSheets = Object.keys(manifest.spritesheets);
		var aFonts = Object.keys(manifest.fonts);
		var iResourcesToLoad = aSheets.length + aFonts.length;

		// nothing to do, no sprites used
		if (iResourcesToLoad == 0) {
			log("Nothing to load.", "AssetLoader");
			return resolve();
		}

		log("Loading sprites...", "AssetLoader");

		fnLoadResources("spritesheets");

		fnLoadResources("fonts");

		// TODO: sound
		// TODO: maps
	});
}

export default {
	load
};